import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnInit {
  @Input() progress: any;
  constructor() { }

  ngOnInit() {
  }

}
