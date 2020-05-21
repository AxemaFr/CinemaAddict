import Film from "../models/film.js";
import Comment from "../models/comment.js";
import {Method} from "../const.js";

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  throw new Error(`${response.status}: ${response.statusText}`);
};

export default class Api {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getFilms() {
    return this._load({url: `movies`})
      .then((response) => response.json())
      .then(Film.parseFilms);
  }

  updateFilm(id, data) {
    return this._load({
      url: `movies/${id}`,
      method: Method.PUT,
      body: JSON.stringify(data.toRAW()),
      headers: new Headers({"Content-Type": `application/json`}),
    })
      .then((response) => response.json())
      .then(Film.parseFilm);
  }

  getComments(film) {
    return this._load({url: `comments/${film.id}`})
      .then((response) => response.json())
      .then((data) => Comment.parseComments(data, film.id));
  }

  createComment(comment, filmId) {
    return this._load({
      url: `comments/${filmId}`,
      method: Method.POST,
      body: JSON.stringify(comment.toRAW()),
      headers: new Headers({"Content-Type": `application/json`})
    })
      .then((response) => response.json())
      .then((data) => {
        return {
          film: Film.parseFilm(data.movie),
          models: Comment.parseComments(data.comments, filmId)
        };
      });
  }

  deleteComment(comment) {
    return this._load({url: `comments/${comment.id}`, method: Method.DELETE});
  }

  sync(data) {
    return this._load({
      url: `movies/sync`,
      method: Method.POST,
      body: JSON.stringify(data),
      headers: new Headers({"Content-Type": `application/json`})
    })
      .then((response) => response.json());
  }

  _load({url, method = Method.GET, body = null, headers = new Headers()}) {
    headers.append(`Authorization`, this._authorization);
    return fetch(`${this._endPoint}/${url}`, {method, body, headers})
      .then(checkStatus)
      .catch((err) => {
        throw err;
      });
  }
}
