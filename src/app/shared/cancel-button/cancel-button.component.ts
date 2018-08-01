import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { ContractsService } from '../../services/contracts.service';
import { CosignerService } from '../../services/cosigner.service';
import { CosignerProvider } from '../../providers/cosigner-provider';
import { CosignerOffer } from '../../models/cosigner.model';
import { TxService, Tx } from '../../tx.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cancel-button',
  templateUrl: './cancel-button.component.html',
  styleUrls: ['./cancel-button.component.scss']
})
export class CancelButtonComponent implements OnInit {
  @Input() loan: Loan;
  pending: Tx = undefined;

  private cosignerPromise: Promise<CosignerOffer>;

  constructor(
    private contractService: ContractsService,
    private cosignerService: CosignerService,
    private txService: TxService
  ) { }

  loadPendingTx() {
    this.pending = this.txService.getCancelTx(this.loan);
  }

  ngOnInit() {
    const cosignerProvider = this.cosignerService.getCosigner(this.loan);
    if (cosignerProvider !== undefined) {
      this.cosignerPromise = cosignerProvider.offer(this.loan);
    }
  }

  async clickCancel() {
    if (this.pending !== undefined) {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pending.tx), '_blank');
    } else {
      const cosigner = this.cosignerPromise !== undefined ? await this.cosignerPromise : undefined;
      if (cosigner !== undefined) {
        await cosigner.cancel();
      }

      const tx = await this.contractService.cancelLoan(this.loan);
      this.txService.registerCancelTx(tx, this.loan);
      this.loadPendingTx();
    }
  }
}
