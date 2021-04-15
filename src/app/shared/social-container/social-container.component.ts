import { Component, OnInit } from '@angular/core';
import { Engine } from 'app/models/loan.model';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-social-container',
  templateUrl: './social-container.component.html',
  styleUrls: ['./social-container.component.scss']
})
export class SocialContainerComponent implements OnInit {
  linkContract: string;

  constructor(
    private chainService: ChainService
  ) { }

  ngOnInit() {
    const { config } = this.chainService;
    this.linkContract = config
        .network
        .explorer
        .address
        .replace('${address}', config.contracts[Engine.UsdcEngine].diaspore.loanManager);
  }
}
