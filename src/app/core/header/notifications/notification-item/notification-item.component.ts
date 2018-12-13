import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Notification } from '../../../../models/notification.model';
// import { NotificationsService } from '../../../../services/notifications.service';

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

  constructor(
    // public notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    // this.confirmedTx = this.notification.confirmedTx;
    // this.notificationsService.currentState.subscribe(confirmedTx => this.confirmedTx = confirmedTx);
    console.info(this.notification);
  }
  ngOnChanges() {
    // this.confirmedTx = this.notification.confirmedTx;
    console.info(this.notification, ' Changes');
    console.info(this.confirmedTx, ' Changed');
  }
}
