import AbstractComponent from "./abstract-component.js";
import ContainerComponent from "./container.js";

const createFilmListTemplate = (config) => {
  const {title, isTitleHidden = false, hasExtraModifier = false} = config;

  const visuallyHidden = isTitleHidden ? `visually-hidden` : ``;
  const extraModifier = hasExtraModifier ? `films-list--extra` : ``;
  return (
    `<section class="films-list ${extraModifier}">
      <h2 class="films-list__title ${visuallyHidden}">${title}</h2>
    </section>`
  );
};

export default class FilmList extends AbstractComponent {
  constructor(config) {
    super();

    this._config = config;
    this._containerComponent = new ContainerComponent();
  }

  getTemplate() {
    return createFilmListTemplate(this._config);
  }

  getContainerComponent() {
    if (!this._containerComponent.isElementCreated()) {
      this.getElement().append(this._containerComponent.getElement());
    }

    return this._containerComponent;
  }
}
