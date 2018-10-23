import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MatSnackBar,
  MAT_DIALOG_DATA,
  MatSnackBarHorizontalPosition,
} from '@angular/material';
// App Services
import { environment } from '../../../environments/environment';
import { TxService, Tx } from '../../tx.service';
import { ContractsService } from '../../services/contracts.service';
import { Loan } from '../../models/loan.model';
import { EventsService, Category } from '../../services/events.service';
import { Web3Service } from '../../services/web3.service';
import { CountriesService } from '../../services/countries.service';
import { CivicService } from '../../services/civic.service';
import { CivicAuthComponent } from '../civic-auth/civic-auth.component';
import { DialogLoanPayComponent } from '../../dialogs/dialog-loan-pay/dialog-loan-pay.component';
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
import { DialogInsufficientFoundsComponent } from '../../dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';



@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.scss']
})
export class PayButtonComponent implements OnInit {

	@Input() loan: Loan;
	id: number;
  account: string;
	pendingTx: Tx = undefined;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  opPending = false;
  lendEnabled: Boolean;
  
  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private eventsService: EventsService,
    private web3Service: Web3Service,
    public snackBar: MatSnackBar,
    private civicService: CivicService,
    private countriesService: CountriesService,
    private router: Router, //DAAVID
    public dialog: MatDialog	
  ) {}

  /*handlePay() {
    const dialogRef = this.dialog.open(DialogLoanPayComponent);
		dialogRef.afterClosed().subscribe(to => {
      /*this.eventsService.trackEvent(
        'set-to-pay-loan',
        Category.Loan,
        'loan #' + this.loan.id + ' to ' + to
      ); 

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
  }*/

  async handlePay(forze = false) {
    if (this.opPending && !forze) { return; }

    //this.startOperation();

    try {
      const engineApproved = this.contractsService.isEngineApproved();
      const civicApproved = this.civicService.status();
      const balance = this.contractsService.getUserBalanceRCNWei();
      const required = this.contractsService.estimateRequiredAmount(this.loan);
      if (!await engineApproved) {
        this.showApproveDialog();
        return;
      }

      console.log('Try lend', await required, await balance);
      if (await balance < await required) {
        this.eventsService.trackEvent(
          'show-insufficient-funds-lend',
          Category.Account,
          'loan #' + this.loan.id,
          await required
        );
        this.showInsufficientFundsDialog(await required, await balance);
        return;
      }

      /*(if (!await civicApproved) {     
        this.showCivicDialog();
        return;
      }*/

      const dialogRef = this.dialog.open(DialogLoanPayComponent);
      dialogRef.afterClosed().subscribe(amount => {
        this.eventsService.trackEvent(
          'set-to-pay-loan',
          Category.Loan,
          'loan #' + this.loan.id + ' of ' + amount
        ); 

        this.contractsService.payLoan(this.loan, amount).then((tx) => {
          this.eventsService.trackEvent(
            'pay-loan',
            Category.Loan,
            'loan #' + this.loan.id + ' of ' + amount
          );
          this.txService.registerTransferTx(tx, environment.contracts.basaltEngine, this.loan, amount);
          this.retrievePendingTx();
        });
      });         
      /*const tx = await this.contractsService.lendLoan(this.loan);

      this.eventsService.trackEvent(
        'pay',
        Category.Account,
        'loan #' + this.loan.id
      );

      this.txService.registerLendTx(this.loan, tx);
      this.pendingTx = this.txService.getLastLend(this.loan);)*/
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.message.indexOf('User denied transaction signature') < 0) {
        this.dialog.open(DialogGenericErrorComponent, {
          data: { error: e }
        });
      }
      console.log(e);
    } finally {
      //this.finishOperation();
      console.log("Finally");
    }
  }


  showCivicDialog() {
    const dialogRef: MatDialogRef<CivicAuthComponent> = this.dialog.open(CivicAuthComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handlePay(true);
      } else {
        this.cancelOperation();
      }
    });
  }

 showInsufficientFundsDialog(required: number, funds: number) {
    const dialogRef = this.dialog.open(DialogInsufficientFoundsComponent, { data: {
      required: required,
      balance: funds
    }});
    this.cancelOperation();
  }

  showApproveDialog() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.autoClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handlePay(true);
      } else {
        this.cancelOperation();
      }
    });
  }

  cancelOperation() {
    console.log('Cancel lend');
    this.openSnackBar('Your transaction has failed', '');
    this.opPending = false;
  }  

  finishOperation() {
    console.log('Lend finished');
    this.opPending = false;
  }  

  startOperation() {
    console.log('Started lending');
    this.openSnackBar('Your transaction is being processed. It may take a few seconds', '');
    this.opPending = true;
  }

  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingTransfer(environment.contracts.basaltEngine, this.loan);
  }

  getId(url){
  	return parseInt(url.match(/\d+/g));
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition,
    });
  }  

  clickPay() {
    if (this.pendingTx === undefined) {
      this.eventsService.trackEvent(
        'click-lend',
        Category.Loan,
        'loan #' + this.loan.id
      );

      this.handlePay();
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }  

  ngOnInit() {
  	//this.id = this.getId(this.router.url); //Get id via URL to get the loan.
    this.retrievePendingTx();
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });    
  }

}
