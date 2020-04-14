import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-body-list',
  templateUrl: './body-list.component.html',
  styleUrls: ['./body-list.component.scss']
})
export class BodyListComponent implements OnInit {
  @Input() amountLeft: number;
  @Input() amountRight: number;
  @Input() currency: string;
  @Input() textMiddle: string;
  constructor() { }

  ngOnInit() {}
}
