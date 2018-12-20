import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '../../../../models/notification.model';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {
  @Input() notification: Notification;

  progressbarMode = 'query';

  constructor() {}

  ngOnInit() {}
}
