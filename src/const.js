export const HIDDEN_CLASS = `visually-hidden`;

export const SHOWING_FILM_COUNT_ON_START = 5;
export const SHOWING_FILM_COUNT_BY_BUTTON = 5;

// Максимальное количество фильмов в блоках «Top rated movies» и «Most commented»
export const EXTRA_FILM_COUNT = 2;

export const END_POINT = `https://11.ecmascript.pages.academy/cinemaddict`;
export const AUTHORIZATION = `Basic 001w590ik29889a=`;
export const STORE_VER = `v1`;

export const OUTPUT_FORMAT = `DD MMMM YYYY`;

export const SHAKE_ANIMATION_TIMEOUT = 600;

export const EMOJIS = [`smile`, `sleeping`, `puke`, `angry`];

export const Method = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

export const FilterType = {
  ALL: `all`,
  WATCHLIST: `watchlist`,
  HISTORY: `history`,
  FAVORITES: `favorites`,
};

export const SortType = {
  DEFAULT: `default`,
  DATE: `date`,
  RATING: `rating`,
};

export const MenuItemType = {
  FILTER: `filter`,
  STATISTICS: `statistics`,
};

export const SortTypes = Object.values(SortType);

export const Period = {
  ALL_TIME: `all-time`,
  TODAY: `today`,
  WEEK: `week`,
  MONTH: `month`,
  YEAR: `year`
};

export const Periods = Object.values(Period);

export const Rating = {
  NONE: ``,
  NOVICE: `Novice`,
  FAN: `Fan`,
  MOVIE_BUFF: `Movie Buff`
};
