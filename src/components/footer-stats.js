import AbstractSmartComponent from "./abstract-smart-component.js";

const createFooterStatsTemplate = (count) => {
  return (
    `<p>${count} movies inside</p>`
  );
};

export default class FooterStats extends AbstractSmartComponent {
  constructor() {
    super();

    this._count = 0;
  }

  getTemplate() {
    return createFooterStatsTemplate(this._count);
  }

  recoveryListeners() {
    return;
  }

  setCount(count) {
    this._count = count;
    this.rerender();
  }
}
