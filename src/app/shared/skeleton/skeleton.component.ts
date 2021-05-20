import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnInit {

  @Input() color = '#424345';
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() borderRadius = '1px';

  constructor() { }

  ngOnInit() {
  }

}
