import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fixed-application-ad',
  templateUrl: './fixed-application-ad.component.html',
  styleUrls: ['./fixed-application-ad.component.scss']
})
export class FixedApplicationAdComponent implements OnInit {
  @Input() message: string;
  hidden: boolean;

  constructor() { }

  ngOnInit() {
  }

}
