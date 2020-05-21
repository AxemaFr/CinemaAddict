import AbstractComponent from "./abstract-component.js";
import {Rating} from "../const.js";

const createProfileTemplate = (rating) => {
  return (
    `<section class="header__profile profile">
      <p class="profile__rating">${rating}</p>
      <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
    </section>`
  );
};

export default class Profile extends AbstractComponent {
  constructor() {
    super();

    this._rating = Rating.NONE;
  }

  getTemplate() {
    return createProfileTemplate(this._rating);
  }

  setRating(rating) {
    this._rating = rating;
    this.getElement().querySelector(`.profile__rating`).textContent = rating;
  }
}
