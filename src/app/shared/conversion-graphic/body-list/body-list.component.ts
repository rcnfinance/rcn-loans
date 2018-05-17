import { Component, OnInit, Input } from '@angular/core';
import { Utils } from '../../../utils/utils';

@Component({
  selector: 'app-body-list',
  templateUrl: './body-list.component.html',
  styleUrls: ['./body-list.component.scss']
})
export class BodyListComponent implements OnInit {
  @Input() amountLeft: number;
  @Input() amountRight: number;
  constructor() { }

  ngOnInit() {
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
}
