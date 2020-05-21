export default class CommentsModel {
  constructor() {
    this._comments = [];

    /*
    Признак того, что в модели комментариев были внесены изменения
    Изменения можно внести только в окне дополнительной информации о фильме (popup)
    При выходе из этого окна, в случае наличия изменений, нужно перерисовать блок Most Commented films
    Не получится перерисовать сразу, при открытом popup: этот popup можно открыть как раз на фильме из блока
    Most Commented. Если начать удалять ему комментарии, то после какого-то этот фильм будет должен уйти из блока
    (он перестанет быть most commented). Тогда, по логике, удалив очередной комментарий, popup окажется закрытым,
    ведь блок будет перерисован и соответствующего фильма там не будет. В этом случае получаем странное поведение:
    комментарий удалили - popup закрылся.
    */
    this._isModelChanged = false;
  }

  isModelChanged() {
    return this._isModelChanged;
  }

  resetModelChanged() {
    this._isModelChanged = false;
  }

  setComments(comments) {
    this._comments = this._comments.concat(...comments);
  }

  getComments(film) {
    return this._comments.filter((comment) => comment.filmId === film.id);
  }

  updateComments(comments, filmId) {
    this._comments = this._comments.filter((comment) => comment.filmId !== filmId);
    this._comments = [].concat(this._comments, comments);
    this._isModelChanged = true;
  }

  removeComment(id) {
    const index = this._comments.findIndex((it) => it.id === id);

    if (index === -1) {
      return false;
    }

    this._comments = [].concat(this._comments.slice(0, index), this._comments.slice(index + 1));

    this._isModelChanged = true;

    return true;
  }
}
