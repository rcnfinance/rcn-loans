import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-withdraw-button',
  templateUrl: './withdraw-button.component.html',
  styleUrls: ['./withdraw-button.component.scss']
})
export class WithdrawButtonComponent implements OnInit {
  constructor() { }
  handleWithdraw() {
    console.log('Withdraw clicked');
  }

  ngOnInit() {
  }

}
