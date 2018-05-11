import { Component, Input } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Router } from '@angular/router';
import { Loan } from './../../models/loan.model';

@Component({
  selector: 'app-detail-button',
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.scss']
})
export class DetailButtonComponent {
  @Input() loan: Loan
  constructor(private router: Router) { }
  handleDetail() {
    this.router.navigate(['loan/' + this.loan.id]);
  }
}
