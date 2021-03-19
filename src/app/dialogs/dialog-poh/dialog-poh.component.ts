import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { environment } from 'environments/environment';
import { PohProfile } from 'app/interfaces/poh-profile';
import { ApiService } from 'app/services/api.service';
import { PohService } from 'app/services/poh.service';

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
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private pohService: PohService
  ) { }

  ngOnInit() {
    const { host } = environment.api.poh;
    this.pohHost = host;

    const { address, uri } = this.data;
    this.address = address;

    if (uri) {
      this.loadPohUsingUri(uri);
    } else {
      this.loadPohUsingAddress(address);
    }

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
   * Load PoH using an address
   * @param address Address
   */
  private async loadPohUsingAddress(address: string) {
    const { uri } =
      await this.apiService.getAddressPoh(address).toPromise();
    await this.loadPohUsingUri(uri);
  }

  /**
   * Load PoH using an Registration URI
   * @param uri Registration URI
   */
  private async loadPohUsingUri(uri: string) {
    const { fileURI } =
      await this.pohService.getRegistrationUri(uri).toPromise();
    await this.loadPohProfile(fileURI);
  }

  /**
   * Load PoH profile
   * @param profileUrl File URI
   */
  private async loadPohProfile(profileUrl: string) {
    const profile = await this.pohService.getFileUri(profileUrl).toPromise();
    this.profile = profile;
  }

  private loadUrls() {
    const { address } = this;
    const urlEtherscan = environment.network.explorer.address.replace('${address}', address);
    const urlPoh = `https://app.proofofhumanity.id/profile/${ address }?network=mainnet`;
    this.urlEtherscan = urlEtherscan;
    this.urlPoh = urlPoh;
  }
}
