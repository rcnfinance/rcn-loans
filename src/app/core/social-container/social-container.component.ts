import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-social-container',
  templateUrl: './social-container.component.html',
  styleUrls: ['./social-container.component.scss']
})
export class SocialContainerComponent implements OnInit {
  linkContract: string;

  constructor() { }

  ngOnInit() {
    this.linkContract = environment.network.explorer.address.replace('${address}', environment.contracts.diaspore.loanManager);
  }
}
