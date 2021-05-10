import { Component, OnInit, Input } from '@angular/core';
import { Ad } from 'app/services/application-ads.service';

@Component({
  selector: 'app-fixed-application-ad',
  templateUrl: './fixed-application-ad.component.html',
  styleUrls: ['./fixed-application-ad.component.scss']
})
export class FixedApplicationAdComponent implements OnInit {
  @Input() ad: Ad;
  hidden: boolean;

  constructor() { }

  ngOnInit() {
  }

}
