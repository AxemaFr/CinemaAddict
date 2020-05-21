import FilterComponent from "../components/filter.js";
import {FilterType} from "../const.js";
import {render, replace, RenderPosition} from "../utils/render.js";
import {getFilmsByFilter} from "../utils/filter.js";

export default class FilterController {
  constructor(container, filmsModel) {
    this._container = container;
    this._filmsModel = filmsModel;

    this._activeFilterType = FilterType.ALL;
    this._filterComponent = null;

    this._onFilterChange = this._onFilterChange.bind(this);
    this._onDataChange = this._onDataChange.bind(this);

    this._filmsModel.setDataChangeHandler(this._onDataChange);
  }

  get filterComponent() {
    return this._filterComponent;
  }

  render() {
    const container = this._container;
    const allFilms = this._filmsModel.getFilmsAll();
    const filters = Object.values(FilterType).map((filterType) => {
      return {
        name: filterType,
        count: getFilmsByFilter(allFilms, filterType).length,
        isActive: filterType === this._activeFilterType,
      };
    });
    const oldComponent = this._filterComponent;

    this._filterComponent = new FilterComponent(filters);
    this._filterComponent.setFilterClickHandler(this._onFilterChange);

    if (oldComponent) {
      replace(this._filterComponent, oldComponent);
    } else {
      render(container.getElement(), this._filterComponent, RenderPosition.AFTERBEGIN);
    }
  }

  // Вызывается обработчиком в компоненте фильтра
  _onFilterChange(filterType) {
    this._filmsModel.setFilter(filterType);
    this._activeFilterType = filterType;
  }

  // Вызывается из модели, когда изменяются (приходят новые) данные:
  // соответственно, новые значения фильтров пересчитываются
  _onDataChange() {
    this.render();
  }
}
