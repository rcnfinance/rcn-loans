import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() hasChip: boolean;
  @Input() chipLabel: string;
  @Input() chipValue: number;
}
