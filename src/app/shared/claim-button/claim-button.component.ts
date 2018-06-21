import { Component, OnInit, Input } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { CosignerLiability } from '../../models/cosigner.model';

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss']
})
export class ClaimButtonComponent implements OnInit {
  @Input() loan: Loan;
  @Input() liability: CosignerLiability;

  constructor() { }

  ngOnInit() {
  }
}
