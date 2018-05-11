import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-button',
  templateUrl: './main-button.component.html',
  styleUrls: ['./main-button.component.scss']
})
export class MainButtonComponent implements OnInit {
  handleMain() {
    console.log('You have clicked Main Button!');
  }
  constructor() { }

  ngOnInit() {
  }

}
