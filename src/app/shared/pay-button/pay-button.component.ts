import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { DialogLoanPayComponent } from '../../dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { environment } from '../../../environments/environment';
import { TxService, Tx } from '../../tx.service';
import { ContractsService } from '../../services/contracts.service';
import { Loan } from '../../models/loan.model';
import { EventsService, Category } from '../../services/events.service';

@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.scss']
})
export class PayButtonComponent implements OnInit {

	loan: Loan;
	id: number;
	pendingTx: Tx = undefined;
  
  constructor(
    private contractService: ContractsService,
    private txService: TxService,
    private eventsService: EventsService,
    private router: Router, //DAAVID
    public dialog: MatDialog	
  ) {}

  handlePay() {
    const dialogRef = this.dialog.open(DialogLoanPayComponent);
		dialogRef.afterClosed().subscribe(to => {
      /*this.eventsService.trackEvent(
        'set-to-pay-loan',
        Category.Loan,
        'loan #' + this.loan.id + ' to ' + to
      ); */

      this.contractService.getLoan(this.id).then((loan) => {
      	console.log(loan);
	      this.contractService.payLoan(loan, to).then((tx) => {
	        this.eventsService.trackEvent(
	          'pay-loan',
	          Category.Loan,
	          'loan #' + this.loan.id + ' to ' + to
	        );
	        this.txService.registerTransferTx(tx, environment.contracts.basaltEngine, this.loan, to);
	        this.retrievePendingTx();
	      });
      })
    });   
  }
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingTransfer(environment.contracts.basaltEngine, this.loan);
  }

  getId(url){
  	return parseInt(url.match(/\d+/g));
  }

  ngOnInit() {
  	this.id = this.getId(this.router.url);
  }

}
