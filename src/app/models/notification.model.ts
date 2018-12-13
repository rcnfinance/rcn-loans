export class Notification {
  constructor(
    public hashTx: string,
    public actionEvent: string,
    public starringEvent: string,
    public timeEvent: any,
    public leadingTxt: string,
    public supporterTxt: string,
    public confirmedTx: Boolean

  ) {}

  get time(): any {
    if (this.timeEvent > 0) {
      console.info('Happen');
      return 'Just now';
    }
    console.info('Not');
    return this.timeEvent;
  }
}
