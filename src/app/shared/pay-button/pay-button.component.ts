import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { MatDialog } from '@angular/material';
import { DialogPayComponent } from '../../dialogs/dialog-pay/dialog-pay.component';
import { ContractsService } from '../../services/contracts.service';
import { Tx, TxService } from '../../tx.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pay-button',
  templateUrl: './pay-button.component.html',
  styleUrls: ['./pay-button.component.scss']
})
export class PayButtonComponent implements OnInit {
  @Input() loan: Loan;
  pending: Tx = undefined;

  constructor(
    public dialog: MatDialog,
    private contractService: ContractsService,
    private txService: TxService
  ) { }

  loadPendingTx() {
    this.pending = this.txService.getLastPendingPay(this.loan);
  }

  handlePay() {
    if (this.pending !== undefined) {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pending.tx), '_blank');
    } else {
      const dialogRef = this.dialog.open(DialogPayComponent, { data: {
        loan: this.loan
      }});

      dialogRef.afterClosed().subscribe(amount => {
        this.contractService.payLoan(this.loan, amount).then((tx) => {
          this.txService.registerPayTx(tx, this.loan, amount);
          this.loadPendingTx();
        });
      });
    }
  }

  ngOnInit() {}

}
