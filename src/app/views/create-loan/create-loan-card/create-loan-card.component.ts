import { Component, OnInit, Input } from '@angular/core';
import { Loan } from './../../../models/loan.model';

@Component({
  selector: 'app-create-loan-card',
  templateUrl: './create-loan-card.component.html',
  styleUrls: ['./create-loan-card.component.scss']
})
export class CreateLoanCardComponent implements OnInit {

  @Input() loan: Loan;
  expanded: boolean;

  constructor() { }

  ngOnInit() { }

}
