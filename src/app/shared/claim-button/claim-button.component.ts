import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { CosignerLiability } from '../../models/cosigner.model';
import { TxService } from '../../tx.service';
import { CosignerProvider } from '../../providers/cosigner-provider';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss']
})
export class ClaimButtonComponent implements OnInit {
  @Input() loan: Loan;
  @Input() provider: CosignerProvider;
  liability: Promise<CosignerLiability>;
  pendingTx: string = undefined;
  canClaim: Boolean;
  constructor(
    private txService: TxService
  ) { }
  ngOnInit() {
    this.liability = this.provider.liability(this.loan);
    this.liability.then((liability) => {
      const tx = this.txService.getLastPendingClaim(liability.contract, this.loan);
      if (tx !== undefined) { this.pendingTx = tx.tx; }
      this.canClaim = liability.canClaim;
    });
  }
  claim() {
    if (this.pendingTx === undefined) {
      this.provider.liability(this.loan).then((liability) => {
        liability.claim().then((tx) => {
          // this.txService.registerClaimTx(tx, liability.contract, this.loan);
          this.pendingTx = tx;
        });
      });
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx), '_blank');
    }
  }
}
