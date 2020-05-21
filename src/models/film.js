export default class Film {
  constructor(data) {
    const filmInfo = data[`film_info`];
    const release = filmInfo[`release`];
    const userDetails = data[`user_details`];

    this.id = data[`id`];
    this.comments = [...data[`comments`]];

    this.title = filmInfo[`title`];
    this.originalTitle = filmInfo[`alternative_title`];
    this.poster = filmInfo[`poster`];
    this.largePoster = filmInfo[`poster`];
    this.ageRating = filmInfo[`age_rating`];
    this.rating = filmInfo[`total_rating`];
    this.director = filmInfo[`director`];
    this.writers = [...filmInfo[`writers`]];
    this.actors = [...filmInfo[`actors`]];
    this.releaseDate = new Date(release[`date`]);
    this.country = release[`release_country`];
    this.runtime = filmInfo[`runtime`];
    this.genres = [...filmInfo[`genre`]];
    this.description = filmInfo[`description`] || ``;
    // Краткое описание (не более 140 символов)
    this.summary = this.description.length > 140 ? this.description.substr(0, 139) + `…` : this.description;

    this.userInfo = {
      isWaiting: Boolean(userDetails[`watchlist`]),
      isWatched: Boolean(userDetails[`already_watched`]),
      watchingDate: userDetails[`watching_date`] ? new Date(userDetails[`watching_date`]) : null,
      isFavorite: Boolean(userDetails[`favorite`])
    };
  }

  toRAW() {
    return {
      "id": this.id,
      "comments": [...this.comments],
      "film_info": {
        "title": this.title,
        "alternative_title": this.originalTitle,
        "poster": this.poster,
        "age_rating": this.ageRating,
        "total_rating": this.rating,
        "director": this.director,
        "writers": [...this.writers],
        "actors": [...this.actors],
        "release": {
          "date": this.releaseDate.toISOString(),
          "release_country": this.country
        },
        "runtime": this.runtime,
        "genre": [...this.genres],
        "description": this.description
      },
      "user_details": {
        "watchlist": this.userInfo.isWaiting,
        "already_watched": this.userInfo.isWatched,
        "watching_date": this.userInfo.watchingDate ? this.userInfo.watchingDate.toISOString() : null,
        "favorite": this.userInfo.isFavorite
      }
    };
  }

  static parseFilm(data) {
    return new Film(data);
  }

  static parseFilms(data) {
    return data.map(Film.parseFilm);
  }

  static clone(data) {
    return new Film(data.toRAW());
  }

  removeComment(id) {
    this.comments = this.comments.filter((it) => it !== id);
  }
}
