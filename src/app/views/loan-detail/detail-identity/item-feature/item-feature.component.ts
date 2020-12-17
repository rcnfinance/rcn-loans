import { Component, OnInit, Input } from '@angular/core';
import { Feature } from './../../../../models/identity.model';

@Component({
  selector: 'app-item-feature',
  templateUrl: './item-feature.component.html',
  styleUrls: ['./item-feature.component.scss']
})
export class ItemFeatureComponent implements OnInit {

  @Input() feature: Feature;

  constructor() { }

  ngOnInit() {
  }

}
