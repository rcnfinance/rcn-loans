import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detail-empty',
  templateUrl: './detail-empty.component.html',
  styleUrls: ['./detail-empty.component.scss']
})
export class DetailEmptyComponent {

  @Input() title: string;
  @Input() description: string;

  constructor() { }
}
