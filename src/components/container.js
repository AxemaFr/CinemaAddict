import AbstractComponent from "./abstract-component.js";

const createContainerTemplate = () => {
  return (
    `<div class="films-list__container"></div>`
  );
};

export default class Container extends AbstractComponent {
  getTemplate() {
    return createContainerTemplate();
  }
}
