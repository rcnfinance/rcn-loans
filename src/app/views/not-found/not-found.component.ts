import { Component, OnInit } from '@angular/core';
// App Services
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Not found');
  }

}
