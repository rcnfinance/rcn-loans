import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '../../../../models/notification.model';
import { environment } from '../../../../../environments/environment';
import { Utils } from '../../../../utils/utils';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {
  @Input() notification: Notification;
  deltaFormatted: string;

  progressbarMode = 'query';

  constructor() {}

  openAddres() {
    window.open(environment.network.explorer.tx.replace('${tx}', this.notification.hashTx), '_blank');
  }

  toDeltaFormatted(time: number): string {
    const delta = Math.floor((new Date().getTime() - time) / 1000);
    if (delta <= 60) { return 'Just now'; }
    return Utils.formatDelta(delta, 2, false);
  }

  ngOnInit() {
    this.deltaFormatted = this.toDeltaFormatted(this.notification.time);
  }
}
