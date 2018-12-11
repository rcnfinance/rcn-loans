import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('open', style({
        opacity: 1,
        display: 'block',
        top: '45px'
      })),
      state('closed', style({
        opacity: 0,
        display: 'none',
        top: '48px'
      })),
      transition('open => closed', [
        animate('.3s')
      ]),
      transition('closed => open', [
        animate('.3s')
      ])
    ])
  ]
})
export class IconGroupHeaderComponent implements OnInit {
  oNotifications: object[] = [
    ['object'],
    ['object'],
    ['object']
  ];

  isOpen = true;

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

  toggle() {
    console.info('toggled');
    this.isOpen = !this.isOpen;
  }

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
