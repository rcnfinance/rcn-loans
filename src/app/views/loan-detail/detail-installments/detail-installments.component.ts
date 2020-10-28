import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { Loan } from '../../../models/loan.model';
import { Installment } from './../../../interfaces/installment';
import { Utils } from './../../../utils/utils';
// App services
import { InstallmentsService } from './../../../services/installments.service';

@Component({
  selector: 'app-detail-installments',
  templateUrl: './detail-installments.component.html',
  styleUrls: ['./detail-installments.component.scss']
})
export class DetailInstallmentsComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  componentId = 'detail-installments';

  installments: Installment[] = [];
  nextInstallment: {
    installment: Installment,
    payNumber: string,
    dueDays: string
  };

  constructor(
    private spinner: NgxSpinnerService,
    private installmentsService: InstallmentsService
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
    const installments: Installment[] = await this.installmentsService.getInstallments(loan);
    this.installments = installments;

    const installment: Installment = await this.installmentsService.getCurrentInstallment(loan);
    if (!installment) {
      return;
    }
    const secondsInDay = 86400;
    const addSuffix = (n: number): string => ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';
    const payNumber = `${ installment.payNumber + addSuffix(installment.payNumber) } Pay`;
    const dueDate: number = new Date(moment(installment.dueDate).format()).getTime() / 1000;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
    const daysLeft: number = Math.round((dueDate - nowDate) / secondsInDay);

    let dueDays: string = Utils.formatDelta(dueDate - nowDate, 1);
    if (daysLeft > 1) {
      dueDays += ' left';
    } else if (daysLeft === 1 || daysLeft === 0) {
      dueDays += ' left';
    } else {
      dueDays += ' ago';
    }
    this.nextInstallment = {
      payNumber,
      dueDays,
      installment
    };
  }

}
