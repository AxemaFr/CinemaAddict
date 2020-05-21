import AbstractComponent from "./abstract-component.js";
import {formatFilmDate, getDurationStr} from "../utils/common.js";

const createCheckboxControlMarkup = (text, name, isActive) => {
  const isChecked = isActive ? `checked` : ``;
  return (
    `<input type="checkbox" class="film-details__control-input visually-hidden" id="${name}" name="${name}" ${isChecked}>
    <label for="${name}" class="film-details__control-label film-details__control-label--${name}">${text}</label>`
  );
};

const generateDetailsTableRow = (key, value) => {
  return (
    `<tr class="film-details__row">
      <td class="film-details__term">${key}</td>
      <td class="film-details__cell">${value}</td>
    </tr>`
  );
};

const createGenreMarkup = (genre) => {
  return `<span class="film-details__genre">${genre}</span>`;
};

const createFilmDetailsTemplate = (film) => {
  const {
    largePoster,
    title,
    originalTitle,
    rating,
    ageRating,
    director,
    writers,
    actors,
    releaseDate,
    runtime,
    country,
    genres,
    description,
    userInfo: {isWaiting, isWatched, isFavorite}
  } = film;

  const genresMarkup = genres.map(createGenreMarkup).join(`\n`);

  return (
    `<section class="film-details">
      <form class="film-details__inner" action="" method="get">
        <div class="form-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            <div class="film-details__poster">
              <img class="film-details__poster-img" src="${largePoster}" alt="">

              <p class="film-details__age">${ageRating}+</p>
            </div>

            <div class="film-details__info">
              <div class="film-details__info-head">
                <div class="film-details__title-wrap">
                  <h3 class="film-details__title">${title}</h3>
                  <p class="film-details__title-original">${originalTitle}</p>
                </div>

                <div class="film-details__rating">
                  <p class="film-details__total-rating">${rating}</p>
                </div>
              </div>

              <table class="film-details__table">
                ${generateDetailsTableRow(`Director`, director)}
                ${generateDetailsTableRow(`Writers`, writers.join(`, `))}
                ${generateDetailsTableRow(`Actors`, actors.join(`, `))}
                ${generateDetailsTableRow(`Release Date`, formatFilmDate(releaseDate))}
                ${generateDetailsTableRow(`Runtime`, getDurationStr(runtime))}
                ${generateDetailsTableRow(`Country`, country)}
                ${generateDetailsTableRow(`Genre${genres.length > 1 ? `s` : ``}`, genresMarkup)}
              </table>

              <p class="film-details__film-description">
                ${description}
              </p>
            </div>
          </div>

          <section class="film-details__controls">
            ${createCheckboxControlMarkup(`Add to watchlist`, `watchlist`, isWaiting)}
            ${createCheckboxControlMarkup(`Mark as watched`, `watched`, isWatched)}
            ${createCheckboxControlMarkup(`Mark as favorite`, `favorite`, isFavorite)}
          </section>
        </div>

        <div class="form-details__bottom-container"></div>
      </form>
    </section>`
  );
};

export default class FilmDetails extends AbstractComponent {
  constructor(film) {
    super();

    this._film = film;
  }

  getTemplate() {
    return createFilmDetailsTemplate(this._film, this._emoji);
  }

  get film() {
    return this._film;
  }

  getData() {
    return new FormData(this._getForm());
  }

  enableForm() {
    this._setForm(false);
  }

  disableForm() {
    this._setForm(true);
  }

  // Место, куда добавляется секция комментариев
  getCommentsEntryPointElement() {
    return this.getElement().querySelector(`.form-details__bottom-container`);
  }

  setCloseBtnClickHandler(handler) {
    const filmDetailsCloseBtn = this.getElement().querySelector(`.film-details__close-btn`);
    filmDetailsCloseBtn.addEventListener(`click`, handler);
  }

  setWatchlistInputChangeHandler(handler) {
    this.getElement().querySelector(`#watchlist`).addEventListener(`change`, handler);
  }

  setWatchedInputChangeHandler(handler) {
    this.getElement().querySelector(`#watched`).addEventListener(`change`, handler);
  }

  setFavoriteInputChangeHandler(handler) {
    this.getElement().querySelector(`#favorite`).addEventListener(`change`, handler);
  }

  _getForm() {
    return this.getElement().querySelector(`.film-details__inner`);
  }

  _setForm(isDisabled) {
    Array.from(this._getForm().elements)
    .filter((element) => !element.classList.contains(`film-details__close-btn`))
    .forEach((element) => {
      element.disabled = isDisabled;
    });
  }
}
