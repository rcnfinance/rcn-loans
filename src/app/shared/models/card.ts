export class Card {
  constructor(
    public id: number,
    public name: string,
    public status: string,
    public borrower: string,
    public amount: number,
    public duration: number,
    public annualInterest: number,
    public annualPunitoryInterest: number
  ) { }
}
