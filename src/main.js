import Api from "./api/api.js";
import Provider from "./api/provider.js";
import Store from "./api/store.js";
// Звание пользователя
import ProfileComponent from "./components/profile.js";
// Меню сайта (навигация)
import MenuComponent from "./components/menu.js";
// Секция фильмов (основной контент)
import FilmsComponent from "./components/films.js";
// Статистика
import StatisticsComponent from "./components/statistics.js";
// Количество фильмов
import FooterStatsComponent from "./components/footer-stats.js";

// Контроллеры
import FilterController from "./controllers/filter.js";
import PageController from "./controllers/page.js";

// Модели
import FilmsModel from "./models/films.js";
import CommentsModel from "./models/comments.js";

// Отрисовка элементов
import {render} from "./utils/render.js";
import {MenuItemType, FilterType, END_POINT, AUTHORIZATION, STORE_VER} from "./const.js";
import {getRating, getStoreName} from "./utils/common.js";
import {getFilmsByFilter} from "./utils/filter.js";

const siteHeaderElement = document.querySelector(`.header`);
const siteMainElement = document.querySelector(`.main`);
const siteFooterElement = document.querySelector(`.footer`);

const api = new Api(END_POINT, AUTHORIZATION);
const filmStore = new Store(getStoreName(`film`, STORE_VER), window.localStorage);
const commentStore = new Store(getStoreName(`comment`, STORE_VER), window.localStorage);
const apiWithProvider = new Provider(api, filmStore, commentStore);

const filmsModel = new FilmsModel();
const commentsModel = new CommentsModel();
const models = {filmsModel, commentsModel};

// Профиль (звание) пользователя в шапке сайта и статистике
const profileComponent = new ProfileComponent();
render(siteHeaderElement, profileComponent);

// Меню сайта (навигация)
const menuComponent = new MenuComponent();
render(siteMainElement, menuComponent);

// Фильтр в меню сайта
const filterController = new FilterController(menuComponent, filmsModel);
filterController.render();

// Основной контент: списки фильмов
const filmsComponent = new FilmsComponent();
render(siteMainElement, filmsComponent);

const pageController = new PageController(filmsComponent, models, apiWithProvider);
pageController.renderLoadingMessage();

// Секция статистики
const statisticsComponent = new StatisticsComponent(filmsModel);
render(siteMainElement, statisticsComponent);
statisticsComponent.hide();

// Статистика в подвале сайта
const siteFooterStatsElement = siteFooterElement.querySelector(`.footer__statistics`);
const footerStatsComponent = new FooterStatsComponent();
render(siteFooterStatsElement, footerStatsComponent);

// Реализуем логику переключения экранов
menuComponent.setMenuClickHandler((menuItemType) => {
  switch (menuItemType) {
    case MenuItemType.FILTER:
      pageController.show();
      pageController.resetSortType();
      statisticsComponent.hide();
      break;
    case MenuItemType.STATISTICS:
      pageController.hide();
      statisticsComponent.show();
      break;
  }
});

filmsModel.setDataLoadHandler(() => {
  // Статистика в подвале обновляется только один раз, по окончании загрузки
  footerStatsComponent.setCount(filmsModel.getFilmsAll().length);
});

filmsModel.setDataChangeHandler(() => {
  const rating = getRating(getFilmsByFilter(filmsModel.getFilmsAll(), FilterType.HISTORY).length);
  profileComponent.setRating(rating);
  statisticsComponent.setRating(rating);
});

// Загрузка данных с сервера
// Используем вариант от академии: загружаем сразу все. Если при загрузке комментариев произошла ошибка,
// то действуем так, как если бы не загрузились сами фильмы
apiWithProvider.getFilms()
  .then((films) => {
    filmsModel.setFilms(films);
    // Даем много обещаний загрузить все комментарии по всем фильмам
    return Promise.all(filmsModel.getFilmsAll().map((film) => apiWithProvider.getComments(film)));
  })
  .then((comments) => {
    commentsModel.setComments(comments);
  })
  .catch(() => {
    // В случае ошибки загрузки комментариев очищаем уже загруженные в модель фильмы, чтобы
    // вывести сообщение об отсутствии фильмов согласно ТЗ.
    filmsModel.setFilms([]);
  })
  .finally(() => {
    pageController.removeLoadingMessage();
    pageController.render();
  });

window.addEventListener(`load`, () => {
  navigator.serviceWorker.register(`/sw.js`);
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);
  if (!apiWithProvider.isSynced()) {
    apiWithProvider.sync();
  }
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
