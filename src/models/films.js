import {getFilmsByFilter} from "../utils/filter.js";
import {FilterType} from "../const.js";

export default class FilmsModel {
  constructor() {
    this._films = [];
    this._activeFilterType = FilterType.ALL;

    this._dataLoadHandlers = [];
    this._dataChangeHandlers = [];
    this._filterChangeHandlers = [];
  }

  setFilms(films) {
    this._films = Array.from(films);
    this._callHandlers(this._dataLoadHandlers);
    this._callHandlers(this._dataChangeHandlers);
  }

  setFilter(filterType) {
    this._activeFilterType = filterType;
    this._callHandlers(this._filterChangeHandlers);
  }

  getFilms() {
    return getFilmsByFilter(this._films, this._activeFilterType);
  }

  getFilmsAll() {
    return this._films;
  }

  updateFilm(id, film) {
    const index = this._films.findIndex((it) => it.id === id);

    if (index === -1) {
      return false;
    }

    const oldData = this._films[index];

    this._films = [].concat(this._films.slice(0, index), film, this._films.slice(index + 1));

    this._callHandlers(this._dataChangeHandlers, oldData, film);

    return true;
  }

  setDataLoadHandler(handler) {
    this._dataLoadHandlers.push(handler);
  }

  setDataChangeHandler(handler) {
    this._dataChangeHandlers.push(handler);
  }

  setFilterChangeHandler(handler) {
    this._filterChangeHandlers.push(handler);
  }

  _callHandlers(handlers, ...args) {
    handlers.forEach((handler) => handler(...args));
  }
}
