import Film from "../models/film.js";
import Comment from "../models/comment.js";

const isOnline = () => {
  return window.navigator.onLine;
};

export default class Provider {
  constructor(api, filmStore, commentStore) {
    this._api = api;
    this._filmStore = filmStore;
    this._commentStore = commentStore;

    this._offlineChangedFilms = new Set();
  }

  getFilms() {
    if (isOnline()) {
      return this._api.getFilms()
        .then((films) => {
          const items = films.reduce((acc, current) => {
            return Object.assign({}, acc, {
              [current.id]: current.toRAW(),
            });
          }, {});

          // Полностью перезаписывается хранилище
          this._filmStore.setAllItems(items);

          return films;
        });
    }

    const storeFilms = Object.values(this._filmStore.getItems());

    return Promise.resolve(Film.parseFilms(storeFilms));
  }

  updateFilm(id, data) {
    if (isOnline()) {
      return this._api.updateFilm(id, data)
        .then((newFilm) => {
          this._filmStore.setItem(newFilm.id, newFilm.toRAW());
          return newFilm;
        });
    }

    const localFilm = Film.clone(data);
    this._filmStore.setItem(id, data.toRAW());
    // Помечаем фильм как измененный локально в режиме offline
    this._offlineChangedFilms.add(id);

    return Promise.resolve(localFilm);
  }

  getComments(film) {
    if (isOnline()) {
      return this._api.getComments(film)
        .then((comments) => {
          this._commentStore.setItem(film.id, comments.map((comment) => comment.toRAW()));
          return comments;
        });
    }

    const storeComments = this._commentStore.getItems()[film.id];
    return Promise.resolve(Comment.parseComments(storeComments, film.id));
  }

  createComment(comment, filmId) {
    if (isOnline()) {
      return this._api.createComment(comment, filmId)
        .then((result) => {
          // В ответ на созданный комментарий сервер присылает обратно фильм со всеми его комментариями
          // Добавляем комментарии в локальное хранилище, заменяя уже существующие коменты к данному фильму
          this._commentStore.setItem(filmId, result.models.map((model) => model.toRAW()));

          // Производим изменения только в локальном хранилище фильмов
          // Фильм на сервере не поменялся. А в локальном хранилище у фильма должно измениться поле comments
          this._filmStore.setItem(result.film.id, result.film.toRAW());

          return result;
        });
    }

    return Promise.reject(`You can't create comment in offline`);
  }

  deleteComment(deletingCommentModel) {
    if (isOnline()) {
      return this._api.deleteComment(deletingCommentModel)
        .then(() => {
          // В ответ на удаленный комментарий сервер присылает только статус.
          // Ситуация сильно отличается от добавления комментария, хотя по воздействию на movie.comments оба случая очень похожи
          // Это неудобно, придется делать много лишних движений.

          // Этот комментарий нужно удалить из локального хранилища комментариев.
          const storeComments = this._commentStore.getItems()[deletingCommentModel.filmId]
            .filter((rawComment) => rawComment[`id`] !== deletingCommentModel.id);
          this._commentStore.setItem(deletingCommentModel.filmId, storeComments);

          // Производим изменения в локальном хранилище фильмов
          const storeFilm = this._filmStore.getItems()[deletingCommentModel.filmId];
          const storeFilmComments = storeFilm[`comments`];
          storeFilm[`comments`] = storeFilmComments.filter((id) => id !== deletingCommentModel.id);
          this._filmStore.setItem(deletingCommentModel.filmId, storeFilm);
        });
    }

    return Promise.reject(`You can't delete comment in offline`);
  }

  isSynced() {
    return this._offlineChangedFilms.size === 0;
  }

  sync() {
    if (isOnline()) {
      const storeFilms = this._filmStore.getItems();
      const storeChangedFilms = Array.from(this._offlineChangedFilms).map((id) => storeFilms[id]);
      return this._api.sync(storeChangedFilms)
        .then((response) => {
          const items = response.updated.reduce((acc, current) => {
            return Object.assign({}, acc, {
              [current.id]: current,
            });
          }, {});

          // Перезаписываем в хранилище выбранные фильмы
          this._filmStore.setItems(items);
          // Очищаем множество фильмов, которые нужно синхронизировать
          this._offlineChangedFilms.clear();
        });
    }

    return Promise.reject(new Error(`Sync data failed`));
  }
}
