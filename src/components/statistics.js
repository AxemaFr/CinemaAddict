import AbstractSmartComponent from "./abstract-smart-component.js";
import {getDuration, capitalize} from "../utils/common.js";
import {Period, Periods, Rating} from "../const.js";
import {getWatchedStatistics} from "../utils/statistics.js";
import Chart from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const CLASS_NAME = `statistic__filters`;
const BAR_HEIGHT = 50;

// Это обусловлено тем, что получаем от модели массив отсортированных entries,
// которые информацию хранят как [key, value]
const getEntryValues = (genres, idx) => {
  return Object.values(genres).map((value) => value[idx]);
};

// Отображаются жанры только просмотренных фильмов, а не все жанры загруженных
const renderChart = (statisticCtx, genres) => {
  if (genres.length === 0) {
    return null;
  }

  statisticCtx.height = BAR_HEIGHT * genres.length;

  return new Chart(statisticCtx, {
    plugins: [ChartDataLabels],
    type: `horizontalBar`,
    data: {
      labels: getEntryValues(genres, 0),
      datasets: [{
        data: getEntryValues(genres, 1),
        backgroundColor: `#ffe800`,
        hoverBackgroundColor: `#ffe800`,
        anchor: `start`,
        barThickness: 24
      }]
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 20
          },
          color: `#ffffff`,
          anchor: `start`,
          align: `start`,
          offset: 40,
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: `#ffffff`,
            padding: 100,
            fontSize: 20
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  });
};

const createPeriodMarkup = (period, currentPeriod) => {
  const periodName = capitalize(period).replace(`-`, ` `);
  const checked = period === currentPeriod ? `checked` : ``;
  return (
    `<input type="radio" class="${CLASS_NAME}-input visually-hidden" name="statistic-filter" id="statistic-${period}" value="${period}" ${checked}>
    <label for="statistic-${period}" class="${CLASS_NAME}-label">${periodName}</label>`
  );
};

const createStatisticsTemplate = (statistics, currentPeriod, userRating) => {
  const {watchedCount, totalRuntime, genres} = statistics;
  const totalDuration = getDuration(totalRuntime);
  const topGenre = genres.length > 0 ? genres[0][0] : ``;

  const periodsMarkup = Periods.map((period) => createPeriodMarkup(period, currentPeriod)).join(`\n`);

  return (
    `<section class="statistic">
      <p class="statistic__rank">
        Your rank
        <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
        <span class="statistic__rank-label">${userRating}</span>
      </p>

      <form action="https://echo.htmlacademy.ru/" method="get" class="statistic__filters">
        <p class="statistic__filters-description">Show stats:</p>
        ${periodsMarkup}
      </form>

      <ul class="statistic__text-list">
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">You watched</h4>
          <p class="statistic__item-text">${watchedCount} <span class="statistic__item-description">movies</span></p>
        </li>
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">Total duration</h4>
          <p class="statistic__item-text">${totalDuration.hours()} <span class="statistic__item-description">h</span> ${totalDuration.minutes()} <span class="statistic__item-description">m</span></p>
        </li>
        <li class="statistic__text-item">
          <h4 class="statistic__item-title">Top genre</h4>
          <p class="statistic__item-text">${topGenre}</p>
        </li>
      </ul>

      <div class="statistic__chart-wrap">
        <canvas class="statistic__chart" width="1000"></canvas>
      </div>

    </section>`
  );
};

export default class Statistics extends AbstractSmartComponent {
  constructor(model) {
    super();
    this._model = model;
    this._currentPeriod = Period.ALL_TIME;
    this._chart = null;
    // По умолчанию статистика скрыта и при ее (скрытой) отрисовке не будет происходить обращение за стат. данными
    this._statistics = {watchedCount: 0, totalRuntime: 0, genres: []};

    // Рейтинг пользователя
    this._userRating = Rating.NONE;

    this._subscribeOnEvents();
  }

  getTemplate() {
    return createStatisticsTemplate(this._statistics, this._currentPeriod, this._userRating);
  }

  setRating(rating) {
    this._userRating = rating;
    this.getElement().querySelector(`.statistic__rank-label`).textContent = rating;
  }

  recoveryListeners() {
    this._subscribeOnEvents();
  }

  show() {
    super.show();
    this.rerender();
  }

  rerender() {
    // Обновляем статистические данные
    this._statistics = getWatchedStatistics(this._model.getFilmsAll(), this._currentPeriod);
    // Отрисовываем свежие данные
    super.rerender();
    // Перерисовываем график
    this._renderChart();
  }

  _renderChart() {
    const ctx = this.getElement().querySelector(`.statistic__chart`);
    this._resetChart();
    this._chart = renderChart(ctx, this._statistics.genres);
  }

  _resetChart() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  }

  _subscribeOnEvents() {
    this.getElement().querySelector(`.statistic__filters`).addEventListener(`change`, (evt) => {
      this._currentPeriod = evt.target.value;
      this.rerender();
    });
  }
}
