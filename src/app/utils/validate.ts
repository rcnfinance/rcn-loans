export function validateLoanParameters(_amount, _duration, _firstPayment, _interestRate): boolean {
  if(_amount <= 0 || _duration <= 0 || _firstPayment <= 0 || _interestRate <= 0) {
    // TODO Show an error
    console.log("ERROR");
    return false;
  }
  if(_duration <= _firstPayment){
    // TODO Show an error
    console.log("ERROR");
    return false;
  }
  return true;
}
