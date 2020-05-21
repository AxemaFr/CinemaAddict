import {Period} from "../const.js";
import {isOnePeriod} from "./common.js";

export const getWatchedStatistics = (films, period) => {
  let measure;
  switch (period) {
    case Period.TODAY:
      measure = `days`;
      break;
    case Period.WEEK:
      measure = `weeks`;
      break;
    case Period.MONTH:
      measure = `months`;
      break;
    case Period.YEAR:
      measure = `years`;
      break;
    default:
      measure = null;
      break;
  }

  const today = new Date();
  const watchedFilms = films.filter((film) => {
    return film.userInfo.isWatched && isOnePeriod(film.userInfo.watchingDate, today, measure);
  });
  const totalRuntime = watchedFilms.reduce((accumulator, film) => {
    return accumulator + film.runtime;
  }, 0);
  const genres = watchedFilms.reduce((accumulator, film) => {
    film.genres.forEach((genre) => {
      if (!accumulator[genre]) {
        accumulator[genre] = 0;
      }
      accumulator[genre]++;
    });
    return accumulator;
  }, {});
  const sortedGenres = Object.entries(genres).sort((a, b) => b[1] - a[1]);
  return {watchedCount: watchedFilms.length, totalRuntime, genres: sortedGenres};
};
