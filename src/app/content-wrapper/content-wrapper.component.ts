import { Component, OnInit } from '@angular/core';

// App Component
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  public loading: boolean;
  constructor() {
    this.loading = true;
  }

  ngOnInit() {
    this.loading = false;
  }

}
