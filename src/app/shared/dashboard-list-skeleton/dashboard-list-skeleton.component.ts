import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-list-skeleton',
  templateUrl: './dashboard-list-skeleton.component.html',
  styleUrls: ['./dashboard-list-skeleton.component.scss']
})
export class DashboardListSkeletonComponent {
  @Input() items: number;

  constructor() { }
}
