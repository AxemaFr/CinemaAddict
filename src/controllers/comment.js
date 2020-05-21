// Отрисовка элементов
import {render} from "../utils/render.js";
import {SHAKE_ANIMATION_TIMEOUT} from "../const.js";

// Комментарий
import CommentComponent from "../components/comment.js";

export default class CommentController {
  constructor(container, onDataChange) {
    this._container = container;
    this._onDataChange = onDataChange;

    this._commentComponent = null;
  }

  render(comment) {
    this._commentComponent = new CommentComponent(comment);
    this._commentComponent.setDeleteButtonClickHandler(() => this._onDataChange(this, comment, null));

    const containerElement = this._container.getCommentsListElement();
    render(containerElement, this._commentComponent);
  }

  shake() {
    this._commentComponent.getElement().style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      this._commentComponent.enableDeleteButton();
      this._commentComponent.getElement().style.animation = ``;
    }, SHAKE_ANIMATION_TIMEOUT);
  }
}
