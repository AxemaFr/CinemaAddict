import AbstractComponent from "./abstract-component.js";
import {formatCommentDateAsHuman} from "../utils/common.js";
import {encode} from "he";

const ButtonLabel = {
  ENABLED: `Delete`,
  DISABLED: `Deleting...`
};

const createCommentTemplate = (comment) => {
  const {emoji, text: notSanitizedText, author, day} = comment;
  const text = encode(notSanitizedText);
  return (
    `<li class="film-details__comment">
      <span class="film-details__comment-emoji">
        <img src="./images/emoji/${emoji}.png" width="55" height="55" alt="emoji-${emoji}">
      </span>
      <div>
        <p class="film-details__comment-text">${text}</p>
        <p class="film-details__comment-info">
          <span class="film-details__comment-author">${author}</span>
          <span class="film-details__comment-day">${formatCommentDateAsHuman(day)}</span>
          <button class="film-details__comment-delete">Delete</button>
        </p>
      </div>
    </li>`
  );
};

export default class Comment extends AbstractComponent {
  constructor(comment) {
    super();

    this._comment = comment;
  }

  getTemplate() {
    return createCommentTemplate(this._comment);
  }

  enableDeleteButton() {
    const button = this._getDeleteButton();
    button.disabled = false;
    button.textContent = ButtonLabel.ENABLED;
  }

  disableDeleteButton() {
    const button = this._getDeleteButton();
    button.disabled = true;
    button.textContent = ButtonLabel.DISABLED;
  }

  setDeleteButtonClickHandler(handler) {
    this._getDeleteButton().addEventListener(`click`, (evt) => {
      evt.preventDefault();
      this.disableDeleteButton();
      handler();
    });
  }

  _getDeleteButton() {
    return this.getElement().querySelector(`.film-details__comment-delete`);
  }
}
