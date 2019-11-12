import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-available-loans',
  templateUrl: './no-available-loans.component.html',
  styleUrls: ['./no-available-loans.component.scss']
})
export class NoAvailableLoansComponent implements OnInit {
  winHeight: any = window.innerHeight - 118;
  constructor() { }

  ngOnInit() {
  }

}
