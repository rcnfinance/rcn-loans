import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss']
})
export class IconGroupHeaderComponent implements OnInit {
  availableNotifications = 0;
  viewDetail: string;
  selection: string;
  previousSelection: string;

  constructor() { }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  openDetail(selection: string) {
    console.info('Selection is ' + selection);
    console.info('Previous selection is ' + this.previousSelection);
    this.previousSelection = this.selection;
    this.selection = selection;
    // this.lastTitle = this.title;
    // this.title = clickedTitle;
    // if (clickedTitle !== 3 || this.lastTitle !== 'Menu') { // If i dont click on menu & dont click it twice
    switch (selection) {
      case 'notifications':
        if (selection !== this.previousSelection || this.viewDetail === undefined) {
          console.info('Setted notifications');
          this.viewDetail = selection;
        } else {
          console.info('Setted as undefined');
          this.viewDetail = undefined;
        }
        break;
      default:
        // this.viewDetail = undefined;
        break;
    }
    // console.info(this.viewDetail);
  }

  ngOnInit() {
  }

}
