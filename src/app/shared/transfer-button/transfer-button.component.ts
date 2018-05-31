import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transfer-button',
  templateUrl: './transfer-button.component.html',
  styleUrls: ['./transfer-button.component.scss']
})
export class TransferButtonComponent implements OnInit {

  constructor() { }
  handleTransfer() {
    console.log('You are transffering');
  }
  ngOnInit() {
  }

}
