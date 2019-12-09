import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Loan } from '../../../models/loan.model';
import { Installment } from './../../../interfaces/installment';
// App services
import { InstallmentService } from './../../../services/installment.service';

@Component({
  selector: 'app-detail-installments',
  templateUrl: './detail-installments.component.html',
  styleUrls: ['./detail-installments.component.scss']
})
export class DetailInstallmentsComponent implements OnInit, OnDestroy {

  @Input() loan: Loan;
  installments: Installment[] = [];
  componentId = 'detail-installments';

  constructor(
    private spinner: NgxSpinnerService,
    private installmentService: InstallmentService
  ) { }

  async ngOnInit() {
    this.spinner.show(this.componentId);

    try {
      await this.loadInstallments();
    } catch (e) {
      console.error(e);
    } finally {
      this.spinner.hide(this.componentId);
    }
  }

  ngOnDestroy() {
    this.spinner.hide(this.componentId);
  }

  /**
   * Load the next installment data
   */
  private async loadInstallments() {
    const loan: Loan = this.loan;
    const installments: Installment[] = await this.installmentService.getInstallments(loan);

    this.installments = installments;
    return installments;
  }

}
