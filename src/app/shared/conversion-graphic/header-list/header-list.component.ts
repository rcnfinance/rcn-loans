import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-list',
  templateUrl: './header-list.component.html',
  styleUrls: ['./header-list.component.scss']
})
export class HeaderListComponent implements OnInit {
  @Input() headers: any[];
  constructor() { }

  ngOnInit() {
  }

}
