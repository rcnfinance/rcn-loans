import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss']
})
export class ButtonGroupComponent implements OnInit {

  @Output() view = new EventEmitter<string>();

  openDetail(view: string) {
    this.view.emit(view);
  }

  constructor() { }

  ngOnInit() {
  }

}
