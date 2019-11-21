import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-detail-installments',
  templateUrl: './detail-installments.component.html',
  styleUrls: ['./detail-installments.component.scss']
})
export class DetailInstallmentsComponent implements OnInit {

  @Input() loan: Loan;
  @Input() installments: [];

  constructor() { }

  ngOnInit() {
  }

}
