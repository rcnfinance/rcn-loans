import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss']
})
export class ButtonGroupComponent implements OnInit {
  @Output() view = new EventEmitter<string>();
  @Input() viewDetail;

  openDetail(view: string) {
    this.view.emit(view);
    this.viewDetail = view;
  }

  constructor() { }

  ngOnInit() {}

}
