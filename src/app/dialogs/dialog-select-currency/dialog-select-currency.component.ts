import { Component, OnInit, Input, Inject } from '@angular/core';
import { Loan, Status } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog-select-currency',
  templateUrl: './dialog-select-currency.component.html',
  styleUrls: ['./dialog-select-currency.component.scss']
})
export class DialogSelectCurrencyComponent implements OnInit {
  loan: Loan;

  // leftLabel: string;
  // leftValue: string;
  // rightLabel: string;
  // rightValue: string;
  // durationLabel: string;
  // durationValue: string;
  // canLend: boolean;
  rcnAmount:string;
  daiAmount:string;
  ethAmount:string;
  rcnReturn:string;
  daiReturn:string;
  ethReturn:string;
  loanAmount:string;
  expectedReturn: string;
  loanCurrency:string;


  options= [
    {"id": 1, name: "RCN", img: "../../../assets/rcn.png"},
    {"id": 2, name: "DAI", img: "../../../assets/dai.png"},
    {"id": 2, name: "ETH", img: "../../../assets/eth.png"},
  ]
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
  ) { 
    this.loan = data.loan;
    console.log(data.loan);
  }

  

  ngOnInit() {
    this.loanAmount = this.formatAmount(this.loan.amount);
    this.expectedReturn= this.formatAmount(this.loan.expectedReturn);

    
    // console.info()
    // if (this.loan.status === Status.Request) {
    //   this.leftLabel = 'Lend';
    //   this.leftValue = this.formatAmount(this.loan.amount);
    //   this.rightLabel = 'Return';
    //   this.rightValue = this.formatAmount(this.loan.expectedReturn);
    //   this.durationLabel = 'Duration';
    //   this.durationValue = this.loan.verboseDuration;
    //   this.canLend = true;
    // } else {
    //   this.leftLabel = 'Paid';
    //   this.leftValue = this.formatAmount(this.loan.paid);
    //   this.rightLabel = 'Pending';
    //   this.rightValue = this.formatAmount(this.loan.pendingAmount);
    //   this.durationValue = Utils.formatDelta(this.loan.remainingTime);
    //   this.canLend = false;
    //   if (this.loan.status === Status.Indebt) {
    //     this.durationLabel = 'In debt for';
    //   } else {
    //     this.durationLabel = 'Remaining';
    //   }
    // }
  }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
  formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }

}
