export class Card {
  public id: number;
  public name: string;
  public status: string;
  public borrower: string;
  public amount: number;
  public duration: number;
  public annualInterest: number;
  public annualPunitoryInterest: number;
  constructor(
    id: number,
    name: string,
    status: string,
    borrower: string,
    amount: number,
    duration: number,
    annualInterest: number,
    annualPunitoryInterest: number) {
      this.id = id;
      this.name = name;
      this.status = status;
      this.borrower = borrower;
      this.amount = amount;
      this.duration = duration;
      this.annualInterest = annualInterest;
      this.annualPunitoryInterest = annualPunitoryInterest;
    }
}
