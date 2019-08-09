import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from './../../../models/loan.model';

@Component({
  selector: 'app-detail-installments',
  templateUrl: './detail-installments.component.html',
  styleUrls: ['./detail-installments.component.scss']
})
export class DetailInstallmentsComponent implements OnInit {

  @Input() loan: Loan;

  constructor() { }

  ngOnInit() {
    console.info('detail installments', this.loan);
  }
}
