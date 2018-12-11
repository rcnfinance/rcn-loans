import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss']
})
export class IconGroupHeaderComponent implements OnInit {
  oNotifications: object[] = [
    ['object'],
    ['object'],
    ['object']
  ];

  viewDetail: string = '';
  selection: string;
  previousSelection: string;

  // Progress bar
  progressOn = true;
  color = 'primary';
  mode = 'query';
  value = 50;
  bufferValue = 75;

  constructor() { }

  closeNotifications() {
    this.viewDetail = undefined;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }
  openDetail(selection: string) {
    this.previousSelection = this.selection;
    this.selection = selection;
    switch (selection) {
      case 'notifications':
        if (selection !== this.previousSelection || this.viewDetail === undefined) {
          this.viewDetail = selection;
        } else {
          this.viewDetail = undefined;
        }
        break;
      default:
        break;
    }
  }

  ngOnInit() {
  }

}
