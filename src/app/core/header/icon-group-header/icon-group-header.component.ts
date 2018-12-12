import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('closed', style({
        opacity: 1,
        display: 'block',
        top: '43px'
      })),
      state('open', style({
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
  isOpen = true;
  timeEvent = 0; // TODO define the value

  viewDetail: string;
  selection: string;
  previousSelection: string;

  // Progress bar
  progressOn = true;
  color = 'primary';
  mode = 'query';
  value = 50;
  bufferValue = 75;

  // Notification Model
  mNotification = Notification;
  oNotifications: Array<Notification> = [
    new Notification('Borrowing', '0x35...4bed', this.getTime(this.timeEvent) , 'Creating', 'a new loan'),
    new Notification('Lending', '4bed...0x35', this.getTime(this.timeEvent), 'Creating', 'a new loan'),
    new Notification('Borrowing', '0x35...4bed', this.getTime(200), 'Creating', 'a new loan')
  ];

  constructor() { }

  getTime(timestamp) {
    if (timestamp <= 0) {
      return 'Just now';
    }
    return timestamp + 's';
  }

  closeNotifications() { // Force to close notifications Component by Directive event
    this.viewDetail = undefined;
  }

  isDetail(view: string): Boolean { // Check viewDetail state to open/close notifications Component
    return view === this.viewDetail;
  }
  openDetail(selection: string) { // Change viewDetail state to open/close notifications Component
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
