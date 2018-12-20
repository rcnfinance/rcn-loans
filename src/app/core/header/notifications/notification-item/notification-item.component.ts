import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '../../../../models/notification.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {
  @Input() notification: Notification;
  url: string = environment.url;

  progressbarMode = 'query';

  constructor() {}

  ngOnInit() {
    console.info(this.url);
  }
}
