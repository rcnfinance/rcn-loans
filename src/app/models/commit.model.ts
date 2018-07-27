export class Commit {
  id: string;
  title: string;
  hide: boolean;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
    this.hide = true;
  }

  toggle() {
    this.hide = !this.hide;
  }
}