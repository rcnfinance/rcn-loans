export class Notification {
  constructor(
    public hashTx: String,          // This is the Notification hashTx
    public starringEvent: String,   // This is the Notification starringEvent
    public timeEvent: any,          // This is the Notification timeEvent
    public confirmedTx: Boolean,    // This is the Notification confirmedTx
    public txObject: TxObject         // This is the Notification txObject
  ) {}
}

export class TxObject {
  constructor(
    public title: String,
    public message: String,
    public materialClass: String,
    public icon: String,
    public awesomeClass: String,
    public color: String
  ) {}
}
