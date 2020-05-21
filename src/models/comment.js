export default class Comment {
  constructor(data, filmId) {
    this.filmId = filmId;

    this.id = data[`id`];
    this.author = data[`author`];
    this.text = data[`comment`];
    this.day = new Date(data[`date`]);
    this.emoji = data[`emotion`];
  }

  toRAW() {
    return {
      "id": this.id,
      "author": this.author,
      "comment": this.text,
      "date": this.day.toISOString(),
      "emotion": this.emoji
    };
  }

  static parseComment(data, filmId) {
    return new Comment(data, filmId);
  }

  static parseComments(data, filmId) {
    return data.map((rawComment) => {
      return Comment.parseComment(rawComment, filmId);
    });
  }
}
