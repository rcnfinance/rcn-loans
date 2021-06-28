import { Component, OnInit, Input } from '@angular/core';
import { Notification } from 'app/models/notification.model';
import { Utils } from 'app/utils/utils';
import { ChainService } from 'app/services/chain.service';
import { TxLegacyService } from 'app/services/tx-legacy.service';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {
  @Input() notification: Notification;
  deltaFormatted: string;
  shortAddress: string;

  progressbarMode = 'query';

  constructor(
    private chainService: ChainService,
    private txService: TxLegacyService
  ) {}

  openTx() {
    const { config } = this.chainService;
    window.open(config.network.explorer.tx.replace(
      '${tx}',
      this.notification.hashTx
    ), '_blank');
  }

  openAddress() {
    const { config } = this.chainService;
    window.open(config.network.explorer.address.replace(
      '${address}',
      this.notification.starringEvent.toString()
    ), '_blank');
  }

  toDeltaFormatted(time: number): string {
    const delta = Math.floor((new Date().getTime() - time) / 1000);
    if (delta <= 60) { return 'Just now'; }
    return Utils.formatDelta(delta, 2, false);
  }

  clickCancelTx({ hashTx }: Notification) {
    this.txService.cancelTx(hashTx);
  }

  ngOnInit() {
    if (this.notification) {
      this.deltaFormatted = this.toDeltaFormatted(this.notification.time);
      if (this.notification.txObject.id !== undefined) {
        this.shortAddress = Utils.shortAddress(this.notification.txObject.id.toString());
      }
    }
  }
}
