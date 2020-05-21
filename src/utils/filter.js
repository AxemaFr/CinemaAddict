import {FilterType} from "../const.js";

export const getWatchlistFilms = (films) => {
  return films.filter((film) => film.userInfo.isWaiting);
};

export const getHistoryFilms = (films) => {
  return films.filter((film) => film.userInfo.isWatched);
};

export const getFavoriteFilms = (films) => {
  return films.filter((film) => film.userInfo.isFavorite);
};

export const getFilmsByFilter = (films, filterType) => {
  switch (filterType) {
    case FilterType.ALL:
      return films;
    case FilterType.WATCHLIST:
      return getWatchlistFilms(films);
    case FilterType.HISTORY:
      return getHistoryFilms(films);
    case FilterType.FAVORITES:
      return getFavoriteFilms(films);
  }

  return [];
};
