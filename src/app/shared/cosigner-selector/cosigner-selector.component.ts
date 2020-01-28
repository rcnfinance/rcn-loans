import { Component, Input, OnInit } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { CosignerService } from '../../services/cosigner.service';

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
    private cosignerService: CosignerService
  ) {}

  async ngOnInit() {
    const cosigner = this.cosignerService.getCosigner(this.loan);
    this.hasOptions = cosigner !== undefined;

    if (cosigner) {
      const title = await cosigner.title(this.loan);
      const { cosignerDetail }: any = await cosigner.offer(this.loan);

      this.text = `This loan is backed by a ${ title } (${ cosignerDetail.coordinates })
          valued at value ${ this.loan.currency.toString() }.`;
    }
  }
}
