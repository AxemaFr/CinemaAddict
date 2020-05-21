import AbstractSmartComponent from "./abstract-smart-component.js";
import {SortType, SortTypes} from "../const.js";

const CLASS_NAME = `sort__button`;
const ACTIVE_CLASS = `${CLASS_NAME}--active`;

const createSortMarkup = (sortType, activeSortType) => {
  const active = sortType === activeSortType ? ACTIVE_CLASS : ``;
  return (
    `<li><a href="#" data-sort-type="${sortType}" class="${CLASS_NAME} ${active}">Sort by ${sortType}</a></li>`
  );
};

const createSortTemplate = (activeSortType) => {
  const sortMarkup = SortTypes.map((it) => createSortMarkup(it, activeSortType)).join(`\n`);
  return (
    `<ul class="sort">
      ${sortMarkup}
    </ul>`
  );
};

export default class Sort extends AbstractSmartComponent {
  constructor() {
    super();

    this._currentSortType = SortType.DEFAULT;
    this._setSortTypeClickHandler = null;
  }

  getTemplate() {
    return createSortTemplate(this._currentSortType);
  }

  recoveryListeners() {
    this.setSortTypeClickHandler(this._setSortTypeClickHandler);
  }

  getSortType() {
    return this._currentSortType;
  }

  setSortType(sortType) {
    if (this._currentSortType === sortType) {
      return false;
    }

    this._currentSortType = sortType;
    this.rerender();
    return true;
  }

  setSortTypeClickHandler(handler) {
    this.getElement().addEventListener(`click`, (evt) => {
      evt.preventDefault();

      if (evt.target.tagName !== `A`) {
        return;
      }

      const sortType = evt.target.dataset.sortType;

      if (this._currentSortType === sortType) {
        return;
      }

      this._currentSortType = sortType;

      // Признак активной сортировки установится автоматически
      this.rerender();

      handler(this._currentSortType);
    });

    this._setSortTypeClickHandler = handler;
  }
}
