import { Component, OnInit } from '@angular/core';
import { Item } from '../../item.model';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss']
})
export class CardItemComponent implements OnInit {
  items: Item[] = [
    new Item(22),
  ];
  constructor() { }

  ngOnInit() {
  }

}
