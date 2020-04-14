import { Component, Input, OnInit } from '@angular/core';
import { Loan, LoanType } from '../../models/loan.model';
import { CosignerService } from '../../services/cosigner.service';
import { LoanTypeService } from '../../services/loan-type.service';
import { environment, Agent } from '../../../environments/environment';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-cosigner-selector',
  templateUrl: './cosigner-selector.component.html',
  styleUrls: ['./cosigner-selector.component.scss']
})
export class CosignerSelectorComponent implements OnInit {
  @Input() loan: Loan;
  text: string;
  hasOptions: boolean;

  constructor(
    private cosignerService: CosignerService,
    private loanTypeService: LoanTypeService
  ) {}

  async ngOnInit() {
    const cosigner = this.cosignerService.getCosigner(this.loan);
    this.hasOptions = cosigner !== undefined;

    const type: LoanType = this.loanTypeService.getLoanType(this.loan);
    const cosignerAddress: string = this.getCosignerAddress(this.loan);
    if (type === LoanType.FintechOriginator && cosignerAddress !== Utils.address0x) {
      this.hasOptions = true;
      const shortAddress = Utils.shortAddress(cosignerAddress);
      const cosignerLinkExplorer = environment.network.explorer.address.replace('${address}', cosignerAddress);
      return this.text = `This loan's repayment is guaranteed by the <strong>
      <a href="${ cosignerLinkExplorer }" target="_blank">${ shortAddress }</a>
      </strong> Automatic Buyback Guaranty Pool.`;
    }

    if (cosigner) {
      const title = await cosigner.title(this.loan);
      const { cosignerDetail }: any = await cosigner.offer(this.loan);

      this.text = `This loan is backed by a ${ title } (${ cosignerDetail.coordinates })
          valued at value ${ this.loan.currency.toString() }.`;
    }
  }

  private getCosignerAddress(loan: Loan) {
    const creator: Agent = environment.dir[loan.creator.toLowerCase()];
    const cosignerAddress: string = this.loan.isRequest ? environment.cosigners[creator] : loan.cosigner;
    return cosignerAddress;
  }
}
