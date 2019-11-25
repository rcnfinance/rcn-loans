import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../../models/loan.model';
import { Installment } from './../../../interfaces/installment';
// App services
import { InstallmentService } from './../../../services/installment.service';

@Component({
  selector: 'app-detail-installments',
  templateUrl: './detail-installments.component.html',
  styleUrls: ['./detail-installments.component.scss']
})
export class DetailInstallmentsComponent implements OnInit {

  @Input() loan: Loan;
  installments: Installment[] = [];

  constructor(
    private installmentService: InstallmentService
  ) { }

  ngOnInit() {
    this.loadInstallments();
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
