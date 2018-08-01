import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { CosignerLiability } from '../../models/cosigner.model';
import { TxService } from '../../tx.service';
import { CosignerProvider } from '../../providers/cosigner-provider';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';

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
  canClaim = false;
  constructor(
    private txService: TxService,
    private web3service: Web3Service
  ) { }
  async ngOnInit() {
    this.liability = this.provider.liability(this.loan);
    const liability = await this.liability;
    const paccount = this.web3service.getAccount();
    const tx = this.txService.getLastPendingClaim(liability.contract, this.loan);
    if (tx !== undefined) { this.pendingTx = tx.tx; }
    this.canClaim = liability.canClaim(await paccount);
  }
  claim() {
    if (this.pendingTx === undefined) {
      this.provider.liability(this.loan).then((liability) => {
        console.log(liability);
        liability.claim().then((tx) => {
          this.txService.registerClaimTx(tx, liability.contract, this.loan);
          this.pendingTx = tx;
        });
      });
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx), '_blank');
    }
  }
}
