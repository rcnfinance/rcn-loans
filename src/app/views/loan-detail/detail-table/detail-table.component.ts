import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-detail-table',
  templateUrl: './detail-table.component.html',
  styleUrls: ['./detail-table.component.scss']
})
export class DetailTableComponent implements OnInit {
  @Input() data: [string, string][] = [];

  constructor() { }

  ngOnInit() {
  }
}
