import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { ContractsService } from '../../services/contracts.service';
import { CosignerService } from '../../services/cosigner.service';
import { CosignerProvider } from '../../providers/cosigner-provider';
import { CosignerOffer } from '../../models/cosigner.model';

@Component({
  selector: 'app-cancel-button',
  templateUrl: './cancel-button.component.html',
  styleUrls: ['./cancel-button.component.scss']
})
export class CancelButtonComponent implements OnInit {
  @Input() loan: Loan;

  buttonText = 'Cancel';

  private cosignerPromise: Promise<CosignerOffer>;

  constructor(
    private contractService: ContractsService,
    private cosignerService: CosignerService
  ) { }

  ngOnInit() {
    const cosignerProvider = this.cosignerService.getCosigner(this.loan);
    if (cosignerProvider !== undefined) {
      this.cosignerPromise = cosignerProvider.offer(this.loan);
    }
  }

  async clickCancel() {
    const cosigner = this.cosignerPromise !== undefined ? await this.cosignerPromise : undefined;
    if (cosigner !== undefined) {
      await cosigner.cancel();
    }

    await this.contractService.cancelLoan(this.loan);
  }
}
