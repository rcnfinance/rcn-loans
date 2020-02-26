import { Component, Output, EventEmitter, Input } from '@angular/core';
// App models
import { LoanType } from './../../models/loan.model';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss']
})
export class ButtonGroupComponent {
  @Output() view = new EventEmitter<string>();
  @Input() viewDetail;
  @Input() generatedByUser: boolean; // FIXME: replace by LoanType service
  @Input() loanType: LoanType;

  constructor() { }

  openDetail(view: string) {
    this.view.emit(view);
    this.viewDetail = view;
  }

}
