import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { PohProfile } from 'app/interfaces/poh-profile';
import { PohService } from 'app/services/poh.service';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-dialog-poh',
  templateUrl: './dialog-poh.component.html',
  styleUrls: ['./dialog-poh.component.scss']
})
export class DialogPohComponent implements OnInit {
  profile: PohProfile;
  pohHost: string;
  address: string;
  urlEtherscan: string;
  urlPoh: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {
      address?: string;
      uri?: string;
    },
    private snackBar: MatSnackBar,
    private pohService: PohService,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    const { host } = environment.api.poh;
    this.pohHost = host;

    const { address } = this.data;
    this.address = address;
    this.loadPohProfile(address);

    this.loadUrls();
  }

  /**
   * Copy address to clipboard
   */
  clickCopyAddress() {
    const { address } = this;
    const shadowElement = document.createElement('textarea');
    shadowElement.value = address;
    shadowElement.setAttribute('readonly', '');
    shadowElement.style.position = 'absolute';
    shadowElement.style.left = '-9999px';
    document.body.appendChild(shadowElement);
    shadowElement.select();
    document.execCommand('copy');
    document.body.removeChild(shadowElement);

    this.snackBar.open('Address copied to clipboard!' , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }

  /**
   * Load PoH profile
   * @param profileUrl File URI
   */
  private async loadPohProfile(address: string) {
    const profile = await this.pohService.getProfile(address).toPromise();
    this.profile = profile;
  }

  private loadUrls() {
    const { address } = this;
    const { config } = this.chainService;
    const urlEtherscan = config.network.explorer.address.replace('${address}', address);
    const urlPoh = `https://app.proofofhumanity.id/profile/${ address }?network=mainnet`;
    this.urlEtherscan = urlEtherscan;
    this.urlPoh = urlPoh;
  }
}
