import { Component, OnInit } from '@angular/core';
import { TitleService } from 'app/services/title.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle(`Terms of Use`);
  }

}
