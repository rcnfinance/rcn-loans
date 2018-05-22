import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Loan } from './../../models/loan.model';

import { MaterialModule } from './../../material/material.module';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-detail-button',
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.scss']
})
export class DetailButtonComponent {
  @Input() loan: Loan;
<<<<<<< HEAD
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar
  ) { }
=======
  constructor(private router: Router, public snackBar: MatSnackBar) { }

>>>>>>> 2e8dc0e860de87f4c7c874a75da670df154d839a
  handleDetail() {
    this.router.navigate(['/loan/', this.loan.id]).then(nav => {
      console.log(nav); // true if navigation is successful
    }, err => {
      console.log(err); // when there's an error
    });
  }
  openSnackBar(message: any, action: any) {
    this.snackBar.open(this.loan.amount , this.loan.borrowerShort, {
      duration: 4000,
    });
  }
}


