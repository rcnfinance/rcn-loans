import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss']
})
export class ButtonGroupComponent {
  @Input() viewDetail: string;
  @Input() generatedByUser: boolean;
  @Output() view = new EventEmitter<string>();

  constructor() { }

  openDetail(view: string) {
    this.view.emit(view);
    this.viewDetail = view;
  }

}
