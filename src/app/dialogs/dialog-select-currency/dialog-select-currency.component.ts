import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-select-currency',
  templateUrl: './dialog-select-currency.component.html',
  styleUrls: ['./dialog-select-currency.component.scss']
})
export class DialogSelectCurrencyComponent implements OnInit {

  options= [
    {"id": 1, name: "RCN", img: "../../../assets/rcn.png"},
    {"id": 2, name: "DAI", img: "../../../assets/dai.png"},
    {"id": 2, name: "ETH", img: "../../../assets/eth.png"},
  ]
  constructor() { }

  ngOnInit() {
  }

}
