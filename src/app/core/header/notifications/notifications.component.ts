import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Notification } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('open', style({
        opacity: 1,
        display: 'block',
        top: '43px'
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
export class NotificationsComponent implements OnInit {
  viewDetail: string;
  selection: string;
  previousSelection: string;
  isOpen = true; // TODO delete

  timeEvent = 0; // TODO define the value

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
   // Change value of detail from Notifications Service
  notificationsCounter: any = this.notificationsService.changeCounter(this.oNotifications.length);

  constructor(
    public notificationsService: NotificationsService
  ) { }

  getTime(timestamp) {
    if (timestamp <= 0) {
      return 'Just now';
    }
    return timestamp + 's';
  }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => this.viewDetail = detail); // Subscribe to detail from Notifications Service
  }
}
