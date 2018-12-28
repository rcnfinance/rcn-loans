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

  progressbarMode = 'query';
  urlAddress: String;

  constructor() {}

  ngOnInit() {
    if (environment.envName === 'dev') {
      this.urlAddress = 'https://ropsten.etherscan.io/tx/';
    } else {
      this.urlAddress = 'https://etherscan.io/tx/';
    }
  }
}
