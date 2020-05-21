import AbstractComponent from "./abstract-component.js";
import {EMOJIS} from "../const.js";
import {createElement} from "../utils/render.js";

const IMG_SIZE = 30;
const IMG_LARGE_SIZE = 55;

const createEmojiImgMarkup = (emoji, size = IMG_SIZE) => {
  return emoji ? `<img src="images/emoji/${emoji}.png" width="${size}" height="${size}" alt="emoji-${emoji}">` : ``;
};

const createEmojiMarkup = (emoji) => {
  const emojiImgMarkup = createEmojiImgMarkup(emoji);
  return (
    `<input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-${emoji}" value="${emoji}">
    <label class="film-details__emoji-label" for="emoji-${emoji}">
      ${emojiImgMarkup}
    </label>`
  );
};

const createEmojisMarkup = () => {
  return EMOJIS.map((emoji) => {
    return createEmojiMarkup(emoji);
  }).join(`\n`);
};

const createFilmDetailsTemplate = (film) => {
  const emojisMarkup = createEmojisMarkup();

  return (
    `<section class="film-details__comments-wrap">
      <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${film.comments.length}</span></h3>

      <ul class="film-details__comments-list"></ul>

      <div class="film-details__new-comment">
        <div for="add-emoji" class="film-details__add-emoji-label"></div>

        <label class="film-details__comment-label">
          <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment"></textarea>
        </label>

        <div class="film-details__emoji-list">
          ${emojisMarkup}
        </div>
      </div>
    </section>`
  );
};

export default class FilmDetails extends AbstractComponent {
  constructor(film) {
    super();

    this._film = film;
    this._controllerHandler = null;
    this._ctrlEnterKeyDownHandler = this._ctrlEnterKeyDownHandler.bind(this);

    this._subscribeOnEvents();
  }

  getTemplate() {
    return createFilmDetailsTemplate(this._film);
  }

  // Место, куда добавляются отдельные комментарии
  getCommentsListElement() {
    return this.getElement().querySelector(`.film-details__comments-list`);
  }

  // Используем этот элемент, для "покачивания головой" и создания красной обводки в случае ошибки
  getNewCommentElement() {
    return this.getElement().querySelector(`.film-details__new-comment`);
  }

  setError() {
    this.getNewCommentElement().classList.add(`error`);
  }

  _removeError() {
    this.getNewCommentElement().classList.remove(`error`);
  }

  setCtrlEnterKeyDownHandler(handler) {
    this._controllerHandler = handler;
    this.getElement().querySelector(`.film-details__comment-input`)
      .addEventListener(`keydown`, this._ctrlEnterKeyDownHandler);
  }

  _ctrlEnterKeyDownHandler(evt) {
    if ((evt.key === `Enter`) && (evt.ctrlKey || evt.metaKey)) {
      // Не дать возможности много раз нажать Ctrl+Enter
      this.getElement().querySelector(`.film-details__comment-input`)
        .removeEventListener(`keydown`, this._ctrlEnterKeyDownHandler);

      // Убрать у формы красную обводку (если она есть)
      this._removeError();

      // Запустить обработчик переданный из контроллера
      this._controllerHandler();
    }
  }

  _subscribeOnEvents() {
    // Выбранная эмоция отображается слева от поля ввода комментария
    this.getElement().querySelectorAll(`.film-details__emoji-item`)
      .forEach((element) => {
        element.addEventListener(`change`, (evt) => {
          this._emoji = evt.target.value;
          const emojiImgMarkup = createEmojiImgMarkup(evt.target.value, IMG_LARGE_SIZE);
          const imgElement = createElement(emojiImgMarkup);
          const emojiContainer = this.getElement().querySelector(`.film-details__add-emoji-label`);
          if (emojiContainer.hasChildNodes()) {
            emojiContainer.replaceChild(imgElement, emojiContainer.firstChild);
          } else {
            emojiContainer.appendChild(imgElement);
          }
        });
      });
  }
}
