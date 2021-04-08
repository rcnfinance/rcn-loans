import { Component, OnInit, Input } from '@angular/core';
import { Loan } from 'app/models/loan.model';
import { ChainService } from 'app/services/chain.service';
import { IdentityService } from 'app/services/identity.service';
import { Identity, CompanyIdentity } from 'app/models/identity.model';

@Component({
  selector: 'app-detail-identity',
  templateUrl: './detail-identity.component.html',
  styleUrls: ['./detail-identity.component.scss']
})
export class DetailIdentityComponent implements OnInit {
  @Input() loan: Loan;
  identity: Identity;
  constructor(
    private chainService: ChainService,
    private identityService: IdentityService
  ) { }

  get class(): string {
    if (this.identity === undefined) { return; }
    switch (this.identity.constructor) {
      case CompanyIdentity:
        return 'company';
      default:
        return;
    }
  }

  hasIdentity(): boolean {
    if (this.identity === undefined) {
      return;
    }

    return true;
  }

  ngOnInit() {
    this.identityService.getIdentity(this.loan).then((identity) => {
      this.identity = identity;
    });
  }

  get borrowerLinkExplorer(): string {
    const { config } = this.chainService;
    return config.network.explorer.address.replace('${address}', this.loan.borrower);
  }
}
