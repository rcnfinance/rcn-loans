import { Component, OnInit } from '@angular/core';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    // this.spinner.show(); // Initialize spinner
    // this.spinner.hide(); // Stop spinner
  }

}
