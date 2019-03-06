import { Component, OnInit, Input } from '@angular/core';
import { Loan, Status } from '../../../models/loan.model';
import { Utils } from '../../../utils/utils';

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
