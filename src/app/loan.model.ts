function formatAddress(hex : string): string {
    return hex.replace("0x000000000000000000000000", "0x");
}

export class Loan {
    public id: number;
    public status: number;
    public borrower: string;
    public creator: string;
    public amount: number;
    public duration: number;
    public annualInterest: number;
    public annualPunitoryInterest: number;
    constructor(
      id: number,
      status: number,
      borrower: string,
      creator: string,
      amount: number,
      duration: number,
      annualInterest: number,
      annualPunitoryInterest: number) {
        this.id = id;
        this.status = status;
        this.borrower = formatAddress(borrower);
        this.creator = formatAddress(creator);
        this.amount = amount;
        this.duration = duration;
        this.annualInterest = annualInterest;
        this.annualPunitoryInterest = annualPunitoryInterest;
      }
  }
  