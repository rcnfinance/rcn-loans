import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Loan } from './../../models/loan.model';

@Component({
  selector: 'app-detail-button',
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.scss']
})
export class DetailButtonComponent {
  @Input() loan: Loan;

  constructor(
    public snackBar: MatSnackBar
  ) { }
}
