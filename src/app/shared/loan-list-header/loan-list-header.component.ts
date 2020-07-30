import { Component, OnInit, Input } from '@angular/core';
enum PageView {
  Activity = 'active-loans',
  Address = 'address',
  Lend = 'requested-loans'
}

@Component({
  selector: 'app-loan-list-header',
  templateUrl: './loan-list-header.component.html',
  styleUrls: ['./loan-list-header.component.scss']
})
export class LoanListHeaderComponent implements OnInit {
  @Input() view: PageView;

  constructor() { }

  ngOnInit() {
  }

}
