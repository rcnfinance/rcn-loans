import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loan-list-skeleton',
  templateUrl: './loan-list-skeleton.component.html',
  styleUrls: ['./loan-list-skeleton.component.scss']
})
export class LoanListSkeletonComponent implements OnInit {

  @Input() items: number;

  constructor() { }

  ngOnInit() {
  }

}
