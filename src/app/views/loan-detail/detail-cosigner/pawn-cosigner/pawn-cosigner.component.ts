import { Component, OnInit, Input } from '@angular/core';
import { PawnCosignerProvider } from '../../../../providers/cosigners/pawn-cosigner-provider';
import { Loan, Status } from '../../../../models/loan.model';
import { AssetItem } from '../../../../models/asset.model';
import { PawnCosigner } from '../../../../models/cosigners/pawn-cosigner.model';

@Component({
  selector: 'app-pawn-cosigner',
  templateUrl: './pawn-cosigner.component.html',
  styleUrls: ['./pawn-cosigner.component.scss']
})
export class PawnCosignerComponent implements OnInit {
  @Input() loan: Loan;
  @Input() cosignerProvider: PawnCosignerProvider;

  content: AssetItem[] = [];

  constructor() { }

  async ngOnInit() {
    if (this.loan.status === Status.Request) {
      const detail = (await this.cosignerProvider.offer(this.loan)).cosignerDetail as PawnCosigner;
      this.content = detail.assets;
    } else {
      const detail = (await this.cosignerProvider.liability(this.loan)).cosignerDetail as PawnCosigner;
      this.content = detail.assets;
    }
  }
}
