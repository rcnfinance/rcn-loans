import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  log = [];

  addItem() {
    this.log.push(this.log.length + 1);
    console.log('You have ' + this.log + ' logs');
  }
  ngOnInit() {}
  constructor() { }

}
