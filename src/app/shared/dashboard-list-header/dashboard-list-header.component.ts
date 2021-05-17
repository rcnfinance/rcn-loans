import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-list-header',
  templateUrl: './dashboard-list-header.component.html',
  styleUrls: ['./dashboard-list-header.component.scss']
})
export class DashboardListHeaderComponent implements OnInit {

  @Input() name: string;

  constructor() { }

  ngOnInit() {
  }

}
