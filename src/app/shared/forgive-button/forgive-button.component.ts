import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgive-button',
  templateUrl: './forgive-button.component.html',
  styleUrls: ['./forgive-button.component.scss']
})
export class ForgiveButtonComponent implements OnInit {
  constructor() { }
  
  handleForgive() {
    console.log('You are forgiving');
  }

  ngOnInit() {}

}
