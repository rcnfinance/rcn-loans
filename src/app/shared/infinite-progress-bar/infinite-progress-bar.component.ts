import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-infinite-progress-bar',
  templateUrl: './infinite-progress-bar.component.html',
  styleUrls: ['./infinite-progress-bar.component.scss']
})
export class InfiniteProgressBarComponent implements OnInit, OnChanges {

  @Input() initialProgress = 0;
  @Input() start: boolean;
  @Input() end: boolean;
  @Input() cancel: boolean;
  @Input() mode: 'determinate' | 'indeterminate' = 'determinate';
  @Output() finish = new EventEmitter();
  progress: number;
  interval: any;

  constructor() { }

  ngOnInit() {
    if (this.start) {
      this.startProgress();
    }
  }

  ngOnChanges(e) {
    console.info('infinite progress bar changes', e);
    // TODO: detect START and call this.startProgress()
    // TODO: detect CANCEL and call this.finishProgress()
    // TODO: detect END and call this.cancelProgress()
  }

  /**
   * Start to increase progress
   */
  startProgress() {
    this.progress = this.initialProgress;
    this.fastProgress();
  }

  /**
   * Increase progress fastly
   */
  fastProgress() {
    this.interval = setInterval(() => {
      if (this.progress >= 38) {
        this.stopProgress();
        this.mediumProgress();
        return;
      }
      this.progress ++;
    }, 250);
  }

  /**
   * Increase progress
   */
  mediumProgress() {
    this.interval = setInterval(() => {
      if (this.progress >= 78) {
        this.stopProgress();
        this.slowProgress();
        return;
      }
      this.progress ++;
    }, 400);
  }

  /**
   * Increase progress slowly
   */
  slowProgress() {
    this.interval = setInterval(() => {
      if (this.progress >= 92) {
        this.stopProgress();
        this.verySlowProgress();
        return;
      }
      this.progress ++;
    }, 900);
  }

  /**
   * Increase progress very slowly
   */
  verySlowProgress() {
    this.interval = setInterval(() => {
      if (this.progress >= 98) {
        this.stopProgress();
        return;
      }
      this.progress ++;
    }, 1600);
  }

  /**
   * Finish progress and set 100%
   * @fires finish
   */
  finishProgress() {
    this.stopProgress();
    this.progress = 100;
    setTimeout(() => this.finish.emit(), 1000);
  }

  /**
   * Cancel progress and set 0%
   * @fires finish
   */
  cancelProgress() {
    this.stopProgress();
    this.progress = 0;
    setTimeout(() => this.finish.emit(), 1000);
  }

  /**
   * Clear and stop progress interval
   */
  stopProgress(interval = this.interval) {
    clearInterval(interval);
  }
}
