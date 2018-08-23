import { Component, OnInit, Input } from '@angular/core';

// App Component
import { MatDialog } from '@angular/material';
import { DialogLoanTransferComponent } from '../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { TxService, Tx } from '../../tx.service';
import { environment } from '../../../environments/environment';
import { Loan } from '../../models/loan.model';
import { EventsService, Category } from '../../services/events.service';

@Component({
  selector: 'app-transfer-button',
  templateUrl: './transfer-button.component.html',
  styleUrls: ['./transfer-button.component.scss']
})
export class TransferButtonComponent implements OnInit {
  @Input() loan: Loan;
  pendingTx: Tx = undefined;
  constructor(
    private contractService: ContractsService,
    private txService: TxService,
    private eventsService: EventsService,
    public dialog: MatDialog
  ) { }

  handleTransfer() {}

  loanTransfer() {
    const dialogRef = this.dialog.open(DialogLoanTransferComponent);

    dialogRef.afterClosed().subscribe(to => {
      this.eventsService.trackEvent(
        'set-to-transfer-loan',
        Category.Loan,
        'loan #' + this.loan.id + ' to ' + to
      );
      this.contractService.transferLoan(this.loan, to).then((tx) => {
        this.eventsService.trackEvent(
          'transfer-loan',
          Category.Loan,
          'loan #' + this.loan.id + ' to ' + to
        );
        this.txService.registerTransferTx(tx, environment.contracts.basaltEngine, this.loan, to);
        this.retrievePendingTx();
      });
    });
  }

  clickTransfer() {
    if (this.pendingTx === undefined) {
      this.eventsService.trackEvent(
        'click-transfer-loan',
        Category.Loan,
        'loan #' + this.loan.id
      );

      this.loanTransfer();
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingTransfer(environment.contracts.basaltEngine, this.loan);
  }

  ngOnInit() {
    this.retrievePendingTx();
  }
}
