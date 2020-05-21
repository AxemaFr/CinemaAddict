// Отрисовка элементов
import {render, remove, RenderPosition} from "../utils/render.js";

import FilmController from "./film.js";

// Сортировка
import SortComponent from "../components/sort.js";
import {SortType, SHOWING_FILM_COUNT_ON_START, EXTRA_FILM_COUNT, SHOWING_FILM_COUNT_BY_BUTTON} from "../const.js";

// Секция со списками фильмов. Содержит заголовок и контейнер списка
import FilmListComponent from "../components/film-list.js";
// Кнопка «Show more»
import ShowMoreButtonComponent from "../components/show-more-button.js";

// Данные по фильмам в категориях Top rated и Most commented
import {getTopRatedFilms, getMostCommentedFilms} from "../utils/extra-film.js";

const getSortedFilms = (films, sortType) => {
  let comparator;

  switch (sortType) {
    case SortType.DATE:
      comparator = (a, b) => b.releaseDate - a.releaseDate;
      break;
    case SortType.RATING:
      comparator = (a, b) => Number(b.rating) - Number(a.rating);
      break;
    case SortType.DEFAULT:
      comparator = null;
  }

  if (comparator) {
    return films.slice().sort(comparator);
  }

  return films;
};


export default class PageController {
  constructor(container, models, api) {
    this._container = container;
    this._models = models;
    this._filmsModel = models.filmsModel;
    this._api = api;

    this._showedFilmControllers = [];
    this._topRatedFilmControllers = [];
    this._mostCommentedFilmControllers = [];

    this._showingFilmCount = SHOWING_FILM_COUNT_ON_START;

    this._sortComponent = new SortComponent();
    this._loadingFilmListComponent = new FilmListComponent({title: `Loading...`});
    this._noFilmListComponent = new FilmListComponent({title: `There are no movies in our database`});
    this._mainFilmListComponent = new FilmListComponent({title: `All movies. Upcoming`, isTitleHidden: true});
    this._topRatedFilmListComponent = new FilmListComponent({title: `Top rated`, hasExtraModifier: true});
    this._mostCommentedFilmListComponent = new FilmListComponent({title: `Most commented`, hasExtraModifier: true});
    this._showMoreButtonComponent = new ShowMoreButtonComponent();

    this._onViewChange = this._onViewChange.bind(this);
    this._onSortTypeChange = this._onSortTypeChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._onFilmChange = this._onFilmChange.bind(this);
    this._onCommentsChange = this._onCommentsChange.bind(this);

    this._sortComponent.setSortTypeClickHandler(this._onSortTypeChange);

    this._filmsModel.setFilterChangeHandler(this._onFilterChange);
    this._filmsModel.setDataChangeHandler(this._onFilmChange);
  }

  hide() {
    this._container.hide();
    this._sortComponent.hide();
  }

  show() {
    this._container.show();
    this._sortComponent.show();
  }

  // Заглушка на время загрузки фильмов
  renderLoadingMessage() {
    render(this._container.getElement(), this._loadingFilmListComponent);
  }

  removeLoadingMessage() {
    remove(this._loadingFilmListComponent);
  }

  render() {
    // Сортировка
    render(this._container.getElement(), this._sortComponent, RenderPosition.BEFORE);

    const films = this._filmsModel.getFilms();
    // Если фильмов нет, то показываем соответствующее сообщение
    if (films.length === 0) {
      render(this._container.getElement(), this._noFilmListComponent);
      return;
    }

    // Все фильмы (отфильтрованные фильмы)
    render(this._container.getElement(), this._mainFilmListComponent);
    this._renderFilms(films.slice(0, this._showingFilmCount));
    this._renderLoadMoreButton(films);

    // Top rated фильмы
    const topRatedFilms = getTopRatedFilms(films, EXTRA_FILM_COUNT);
    if (topRatedFilms.length > 0) {
      render(this._container.getElement(), this._topRatedFilmListComponent);
      this._topRatedFilmControllers = this._renderFilmCollection(this._topRatedFilmListComponent, topRatedFilms);
    }

    // Most commented фильмы
    render(this._container.getElement(), this._mostCommentedFilmListComponent);
    this._renderMostCommentedFilms();
  }

  resetSortType() {
    if (this._sortComponent.setSortType(SortType.DEFAULT)) {
      this._onSortTypeChange(SortType.DEFAULT);
    }
  }

  _renderFilmCollection(filmList, filmCollection) {
    return filmCollection.map((film) => {
      const filmController = new FilmController(filmList, this._models, this._api, this._onCommentsChange, this._onViewChange);
      filmController.render(film);
      return filmController;
    });
  }

  // Добавление кнопки "Show more" после списка отфильтрованных фильмов
  _renderLoadMoreButton(source) {
    // Если отрисовывается кнопка, которая уже есть на странице, то она не продублируется, но добавится еще один обработчик
    // Поэтому удаляем ее полностью (не только из DOM, но и сам элемент, к которому привязывается обработчик)
    if (this._showMoreButtonComponent.isElementCreated()) {
      remove(this._showMoreButtonComponent);
    }

    // Отображаем кнопку по необходимости
    if (this._showingFilmCount >= source.length) {
      return;
    }

    render(this._mainFilmListComponent.getElement(), this._showMoreButtonComponent);

    this._showMoreButtonComponent.setClickHandler(() => {
      const prevFilmCount = this._showingFilmCount;
      this._showingFilmCount += SHOWING_FILM_COUNT_BY_BUTTON;

      this._renderFilms(source.slice(prevFilmCount, this._showingFilmCount));

      if (this._showingFilmCount >= source.length) {
        remove(this._showMoreButtonComponent);
      }
    });
  }

  _removeFilms() {
    this._showedFilmControllers.forEach((controller) => controller.destroy());
    this._showedFilmControllers = [];
  }

  _renderFilms(films) {
    const newFilmControllers = this._renderFilmCollection(this._mainFilmListComponent, films);
    this._showedFilmControllers = this._showedFilmControllers.concat(newFilmControllers);

    this._showingFilmCount = this._showedFilmControllers.length;
  }

  _rerenderFilms(count) {
    this._removeFilms();
    const films = this._filmsModel.getFilms();
    this._renderFilms(films.slice(0, count));
    this._renderLoadMoreButton(films);
  }

  _renderMostCommentedFilms() {
    const films = this._filmsModel.getFilms();
    const mostCommentedFilms = getMostCommentedFilms(films, EXTRA_FILM_COUNT);
    if (mostCommentedFilms.length === 0) {
      // Блок нужно спрятать, если нет больше фильмов с комментариями
      this._mostCommentedFilmListComponent.hide();
    } else {
      remove(this._mostCommentedFilmListComponent.getContainerComponent());
      this._mostCommentedFilmControllers = this._renderFilmCollection(this._mostCommentedFilmListComponent, mostCommentedFilms);
      this._mostCommentedFilmListComponent.show();
    }
  }

  _onFilmChange(oldData, filmModel) {
    [this._showedFilmControllers, this._topRatedFilmControllers, this._mostCommentedFilmControllers]
    .forEach((controllerGroup) => {
      controllerGroup.forEach((controller) => {
        const film = controller.filmComponent.film;
        if (film === oldData) {
          controller.render(filmModel);
        }
      });
    });
  }

  _onCommentsChange() {
    this._renderMostCommentedFilms();
  }

  _onViewChange() {
    [this._showedFilmControllers, this._topRatedFilmControllers, this._mostCommentedFilmControllers]
      .forEach((controllerGroup) => {
        controllerGroup.forEach((controller) => controller.setDefaultView());
      });
  }

  _onSortTypeChange(sortType) {
    // Очищаем контейнер фильмов в списке фильмов
    this._removeFilms();
    const sortedFilms = getSortedFilms(this._filmsModel.getFilms(), sortType);
    this._showingFilmCount = SHOWING_FILM_COUNT_ON_START;
    this._renderFilms(sortedFilms.slice(0, this._showingFilmCount));
    this._renderLoadMoreButton(sortedFilms);
  }

  _onFilterChange() {
    this._sortComponent.setSortType(SortType.DEFAULT);
    this._rerenderFilms(SHOWING_FILM_COUNT_ON_START);
  }
}
