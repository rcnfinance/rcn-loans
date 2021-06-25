import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-api-sync',
  templateUrl: './dialog-api-sync.component.html',
  styleUrls: ['./dialog-api-sync.component.scss']
})
export class DialogApiSyncComponent implements OnInit, OnDestroy {
  countdown: string;
  counterInterval: any;

  constructor(public dialogRef: MatDialogRef<DialogApiSyncComponent>) { }

  closeDialog() {
    this.dialogRef.close(DialogApiSyncComponent);
    return;
  }

  ngOnInit() {
    const COUNTER_SECONDS = 30;
    let countdown = COUNTER_SECONDS;
    this.setCountdown(countdown);

    this.counterInterval = setInterval(() => {
      countdown --;
      this.setCountdown(countdown);

      if (countdown <= 0) {
        this.countdown = null;
        clearInterval(this.counterInterval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    try {
      clearInterval(this.counterInterval);
    } catch { }
  }

  clickRefresh() {
    if (this.countdown) {
      return;
    }

    window.location.reload();
  }

  private setCountdown(seconds: number) {
    const COUNTDOWN_HH_MM = new Date(seconds * 1000).toISOString().substr(14, 5);
    this.countdown = COUNTDOWN_HH_MM;
  }
}
