import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Notification } from '../../../../models/notification.model';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit, OnChanges {
  @Input() notification: Notification;

  // Progress bar
  color = 'primary';
  mode = 'query';
  value = 50;
  bufferValue = 75;

  confirmedTx: Boolean;

  constructor() {}

  ngOnInit() {
    this.confirmedTx = this.notification.confirmedTx;
  }
  ngOnChanges() {
    this.confirmedTx = this.notification.confirmedTx;
  }
}
