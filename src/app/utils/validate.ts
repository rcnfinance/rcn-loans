export class Validate {

  static loanParameters(_amount, _duration, _firstPayment, _interestRate): number {
    if(_amount < 0 || _duration < 0 || _firstPayment < 0 || _interestRate < 0) {
      // TODO Show an error
      return;
    }
    if(_duration <= _firstPayment){
      // TODO Show an error
      return;
    }
  }
}
