// Отрисовка элементов
import {render} from "../utils/render.js";
import {SHAKE_ANIMATION_TIMEOUT} from "../const.js";

// Секция, отвечающая за комментарии в детальной информации о фильме
import CommentsComponent from "../components/comments.js";
// Контроллер комментария
import CommentController from "../controllers/comment.js";

import CommentModel from "../models/comment.js";

import Film from "../models/film.js";

const parseFormData = (formData) => {
  return new CommentModel({
    "id": null,
    "author": null,
    "comment": formData.get(`comment`),
    "emotion": formData.get(`comment-emoji`),
    "date": new Date().toISOString(),
  }, null);
};

export default class CommentsController {
  constructor(container, models, api) {
    // FilmDetailsComponent
    this._container = container;
    this._filmsModel = models.filmsModel;
    this._commentsModel = models.commentsModel;
    this._api = api;

    this._commentsComponent = null;

    this._onCommentDataChange = this._onCommentDataChange.bind(this);
    this._ctrlEnterKeyDownHandler = this._ctrlEnterKeyDownHandler.bind(this);
  }

  // Отрисовка секции комментариев
  render() {
    this._commentsComponent = new CommentsComponent(this._container.film);
    // Используется, чтобы отловить нажатие Ctrl+Enter на поле комментария
    this._commentsComponent.setCtrlEnterKeyDownHandler(this._ctrlEnterKeyDownHandler);

    render(this._container.getCommentsEntryPointElement(), this._commentsComponent);
    this._renderComments();
  }

  shake() {
    const newCommentElement = this._commentsComponent.getNewCommentElement();
    newCommentElement.style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      // Разблокируем форму
      this._container.enableForm();
      // Опять даем возможность нажимать Ctrl+Enter
      this._commentsComponent.setCtrlEnterKeyDownHandler(this._ctrlEnterKeyDownHandler);
      // Убираем анимацию
      newCommentElement.style.animation = ``;
      // Необходимо форме нарисовать красную обводку
      this._commentsComponent.setError();
    }, SHAKE_ANIMATION_TIMEOUT);
  }

  _ctrlEnterKeyDownHandler() {
    const commentModel = parseFormData(this._container.getData());
    // Блокируем форму. Если все пройдет успешно, форма перерисуется и блокировки не будет
    // В случае ошибки, блокировка снимается в shake(), который есть реакция на ошибку.
    this._container.disableForm();
    this._onCommentDataChange(this, null, commentModel);
  }

  // Отрисовка отдельных комментариев
  _renderComments() {
    const film = this._container.film;
    this._commentsModel.getComments(film).forEach((comment) => {
      new CommentController(this._commentsComponent, this._onCommentDataChange).render(comment);
    });
  }

  _onCommentDataChange(controller, oldData, newData) {
    const film = this._container.film;
    if (newData === null) {
      // Удаляем на сервере
      this._api.deleteComment(oldData)
      .then(() => {
        // Удаляем в модели комментариев
        if (this._commentsModel.removeComment(oldData.id)) {
          // Изменяем модель фильма - поле comments
          const changedFilm = Film.clone(film);
          changedFilm.removeComment(oldData.id);

          // Заменим в модели старый фильм на новый
          // В модели сработает обработчик на изменение модели и перерисуется фильм во всех секциях (где он есть) на главном экране
          this._filmsModel.updateFilm(film.id, changedFilm);
        }
      })
        .catch(() => {
          controller.shake();
        });
    } else if (oldData === null) {
      // Добавляем комментарий на сервере
      this._api.createComment(newData, film.id)
        .then((result) => {
          // Получим уже разобранный массив элементов CommentModel
          // Среди них есть тот, который мы добавили. Нам он нужен, так как там появились новые поля: id, author
          // Будет проблематично найти именно его, поэтому нужно все комментарии в модели заменить на новые
          this._commentsModel.updateComments(result.models, film.id);

          // Также получим измененный фильм (изменились данные в структуре movie.comments)
          // Заменим в модели старый фильм на новый
          // В модели сработает обработчик на изменение модели и перерисуется фильм во всех секциях (где он есть) на главном экране
          this._filmsModel.updateFilm(film.id, result.film);
        })
        .catch(() => {
          controller.shake();
        });
    }
  }
}
