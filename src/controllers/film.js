// Отрисовка элементов
import {render, remove, replace} from "../utils/render.js";

// Карточка фильма
import FilmComponent from "../components/film.js";
// Подробная информация о фильме (попап)
import FilmDetailsComponent from "../components/film-details.js";

// Контроллер отвечающий за всю секцию комментариев к фильму
import CommentsController from "./comments.js";

import FilmModel from "../models/film.js";

const Mode = {
  DEFAULT: `default`,
  POPUP: `popup`,
};

export default class FilmController {
  constructor(container, models, api, onCommentsChange, onViewChange) {
    this._container = container;
    this._models = models;
    this._api = api;
    this._onCommentsChange = onCommentsChange;
    this._onViewChange = onViewChange;

    this._mode = Mode.DEFAULT;

    this._filmComponent = null;
    this._filmDetailsComponent = null;

    this._onEscKeyDown = this._onEscKeyDown.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  get filmComponent() {
    return this._filmComponent;
  }

  render(film) {
    const oldFilmComponent = this._filmComponent;
    const oldFilmDetailsComponent = this._filmDetailsComponent;

    this._filmComponent = new FilmComponent(film);
    this._filmDetailsComponent = new FilmDetailsComponent(film);

    this._filmComponent.setClickHandler(this._onClick);

    this._filmComponent.setWatchlistButtonClickHandler((evt) => {
      evt.preventDefault();
      const newFilm = FilmModel.clone(film);
      newFilm.userInfo.isWaiting = !film.userInfo.isWaiting;
      this._onFilmChange(film, newFilm);
    });

    this._filmComponent.setWatchedButtonClickHandler((evt) => {
      evt.preventDefault();
      const newFilm = FilmModel.clone(film);
      const value = !film.userInfo.isWatched;
      newFilm.userInfo.isWatched = value;
      newFilm.userInfo.watchingDate = value ? new Date() : null;
      this._onFilmChange(film, newFilm);
    });

    this._filmComponent.setFavoriteButtonClickHandler((evt) => {
      evt.preventDefault();
      const newFilm = FilmModel.clone(film);
      newFilm.userInfo.isFavorite = !film.userInfo.isFavorite;
      this._onFilmChange(film, newFilm);
    });

    this._filmDetailsComponent.setCloseBtnClickHandler(this._removeFilmDetails.bind(this));

    this._filmDetailsComponent.setWatchlistInputChangeHandler((evt) => {
      const newFilm = FilmModel.clone(film);
      newFilm.userInfo.isWaiting = evt.target.checked;
      this._onFilmChange(film, newFilm);
    });

    this._filmDetailsComponent.setWatchedInputChangeHandler((evt) => {
      const newFilm = FilmModel.clone(film);
      const value = evt.target.checked;
      newFilm.userInfo.isWatched = value;
      newFilm.userInfo.watchingDate = value ? new Date() : null;
      this._onFilmChange(film, newFilm);
    });

    this._filmDetailsComponent.setFavoriteInputChangeHandler((evt) => {
      const newFilm = FilmModel.clone(film);
      newFilm.userInfo.isFavorite = evt.target.checked;
      this._onFilmChange(film, newFilm);
    });

    // Отрисовка фильма
    if (oldFilmDetailsComponent && oldFilmComponent) {
      replace(this._filmComponent, oldFilmComponent);
      replace(this._filmDetailsComponent, oldFilmDetailsComponent);
      if (this._mode === Mode.POPUP) {
        this._renderComments();
      }
    } else {
      render(this._container.getContainerComponent().getElement(), this._filmComponent);
    }
  }

  setDefaultView() {
    if (this._mode !== Mode.DEFAULT) {
      this._removeFilmDetails();
    }
  }

  destroy() {
    remove(this._filmDetailsComponent);
    remove(this._filmComponent);
    document.removeEventListener(`keydown`, this._onEscKeyDown);
  }

  _renderComments() {
    new CommentsController(this._filmDetailsComponent, this._models, this._api).render();
  }

  _removeFilmDetails() {
    this._filmDetailsComponent.getElement().remove();
    document.removeEventListener(`keydown`, this._onEscKeyDown);
    this._mode = Mode.DEFAULT;

    if (this._models.commentsModel.isModelChanged()) {
      // Перерисовываем блок Most Commented
      this._onCommentsChange();

      // Cбрасываем признак того, что комментарии в popup были изменены
      this._models.commentsModel.resetModelChanged();
    }
  }

  _onFilmChange(oldData, newData) {
    this._api.updateFilm(oldData.id, newData)
      .then((filmModel) => {
        this._models.filmsModel.updateFilm(oldData.id, filmModel);
      });
  }

  _onClick() {
    this._onViewChange();

    // Popup с подробной информацией о фильме будет отрисован последним в контейнере контроллера
    render(this._container.getElement().parentElement, this._filmDetailsComponent);

    if (!this._filmDetailsComponent.getCommentsEntryPointElement().hasChildNodes()) {
      this._renderComments();
    }

    this._mode = Mode.POPUP;

    document.addEventListener(`keydown`, this._onEscKeyDown);
  }

  _onEscKeyDown(evt) {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      this._removeFilmDetails();
    }
  }
}
