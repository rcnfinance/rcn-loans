import { Injectable, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatSnackBar, MatDialog } from '@angular/material';
const Web3 = require('web3');
const WalletLink = require('walletlink');
import WalletConnectProvider from '@walletconnect/web3-provider';
import { environment } from './../../environments/environment';
import { promisify } from './../utils/utils';
import { WalletType, WalletConnection } from './../interfaces/wallet.interface';
// App Component
import { DialogClientAccountComponent } from './../dialogs/dialog-client-account/dialog-client-account.component';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  loginEvent = new EventEmitter<boolean>(true);
  updateBalanceEvent = new EventEmitter();
  private localStorage: any;

  private _web3: any;
  private _ethereum: any;

  // Account properties
  private web3account: any;
  private account: string = null;
  private isLogging: boolean;

  constructor(
    private title: Title,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.localStorage = window.localStorage;
    this._web3 = this.buildWeb3();
  }

  get ethereum(): any {
    return this._ethereum;
  }

  get web3(): any {
    return this._web3;
  }

  get opsWeb3(): any {
    return this.web3account;
  }

  get loggedIn(): boolean {
    return this.web3account !== undefined;
  }

  /**
   * Get wallet account
   * @return Account address
   */
  async getAccount(): Promise<string> {
    if (!this.loggedIn) {
      return;
    }
    if (this.account) {
      return this.account;
    }

    const { selectedAddress } = this.ethereum;

    this.account = selectedAddress;
    return selectedAddress;
  }

  async logout() {
    this.account = undefined;
    this.web3account = undefined;
    this._ethereum = undefined;
  }

  /**
   * Request wallet login and approve connection
   * @param wallet Wallet selected
   * @param force Force new login
   * @fires loginEvent Boolean login event
   * @return Logged in
   */
  async requestLogin(wallet: WalletType, force?: boolean): Promise<boolean> {
    if (this.loggedIn && !force) {
      return true;
    }
    if (force) {
      this.logout();
    }

    return await this.handleWalletConnection(wallet);
  }

  /**
   * Handle the dApp connection after the wallet selection
   * @param wallet Wallet selected
   * @return Logged in
   */
  private async handleWalletConnection(wallet: number) {
    if (!wallet) {
      return;
    }
    if (this.isLogging) {
      return;
    }

    let walletMethod: Promise<boolean>;

    switch (wallet) {
      case WalletType.WalletLink:
        await this.loadWalletlinkWallet();
        walletMethod = this.walletlinkLogin();
        break;

      case WalletType.Metamask:
        await this.loadBrowserWallet();
        walletMethod = this.browserLogin();
        break;

      case WalletType.WalletConnect:
        await this.loadWalletconnectWallet();
        walletMethod = this.browserLogin();
        break;

      default:
        throw Error('Invalid wallet');
    }

    // start login operation
    this.isLogging = true;

    try {
      const successfulLogin = await walletMethod;
      if (!successfulLogin) {
        throw new Error('User rejecred login');
      }

      const candWeb3 = new Web3(this.ethereum);
      this.web3account = candWeb3;
      this.listenAccountUpdates();
      this.listenNetworkChange();

      const network = await promisify(this.web3.eth.net.getId, []);
      const connection: WalletConnection = {
        wallet,
        network
      };

      this.localStorage.setItem('walletConnected', JSON.stringify(connection));
      this.loginEvent.emit(successfulLogin);
      return true;
    } catch (err) {
      return false;
    } finally {
      this.isLogging = false;
    }
  }

  /**
   * Make web3 provider using a browser or extension
   * @return Wallet provider
   */
  private async loadBrowserWallet() {
    if (typeof window.web3 === 'undefined') {
      return;
    }

    // set scoped ethereum
    this._ethereum = window.ethereum;
    console.info('Web3 provider detected');

    // validate network id
    const candWeb3 = new Web3(window.web3.currentProvider);
    const expectedNetworkId = environment.network.id;
    const networkId = await promisify(candWeb3.eth.net.getId, []);

    if (networkId !== expectedNetworkId) {
      console.info('Mismatch provider network ID', networkId, expectedNetworkId);
      return;
    }

    // set web3 account
    const accounts = await promisify(candWeb3.eth.getAccounts, []);
    if (accounts && accounts.length) {
      console.info('Logged in');
      this.account = accounts[0];
      this.web3account = candWeb3;
    }

    return this._ethereum;
  }

  /**
   * Make web3 provider using WalletLink
   * @return Wallet provider
   */
  private async loadWalletlinkWallet() {
    const APP_NAME = this.title.getTitle();
    const APP_LOGO_URL = 'https://rcn.loans/assets/rcn-logo.png';
    const ETH_JSONRPC_URL = environment.network.provider.url;
    const CHAIN_ID = environment.network.id;

    // Initialize WalletLink
    const walletLink = new WalletLink.WalletLink({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL
    });

    // Initialize a Web3 Provider object
    const ethereum = walletLink.makeWeb3Provider(ETH_JSONRPC_URL, CHAIN_ID);

    // set scoped ethereum
    this._ethereum = ethereum;
    return this._ethereum;
  }

  /**
   * Make web3 provider using WalletConnect
   * @return Wallet provider
   */
  private async loadWalletconnectWallet() {
    const INFURA_ID = environment.network.provider.id;
    const CHAIN_ID = environment.network.id;

    //  Create WalletConnect Provider
    const provider = new WalletConnectProvider({
      infuraId: INFURA_ID,
      chainId: CHAIN_ID
    });

    //  Enable session (triggers QR Code modal)
    await provider.enable();

    //  Create Web3
    const candWeb3 = new Web3(provider);
    const accounts = await promisify(candWeb3.eth.getAccounts, []);
    if (accounts && accounts.length) {
      console.info('Logged in');
      this.account = accounts[0];
      this.web3account = candWeb3;
    }

    // set scoped ethereum
    this._ethereum = provider;
    return this._ethereum;
  }

  /**
   * Request dApp conection using a browser or extension
   * @return Successful login
   */
  private async browserLogin(): Promise<boolean> {
    if (typeof window.web3 === 'undefined') {
      // TODO: Open dialog for get metamask
      this.dialog.open(DialogClientAccountComponent);
      throw Error('Please get Metamask');
    }

    // validate network id
    const candWeb3 = new Web3(this.ethereum);
    const expectedNetworkId = environment.network.id;
    const expectedNetworkName = environment.network.name;
    const networkId = await promisify(candWeb3.eth.net.getId, []);

    if (networkId !== expectedNetworkId) {
      this.snackbar.open(`Please connect to the ${ expectedNetworkName } Network.`, null, {
        duration: 4000,
        horizontalPosition: 'center'
      });
      return false;
    }

    // handle wallet connection
    try {
      await this.ethereum.enable();
    } catch (e) {
      console.info('User rejected login');
      return false;
    }

    this.web3account = candWeb3;
    return true;
  }

  /**
   * Request dApp conection using WalletLink
   * @return Successful login
   */
  private async walletlinkLogin(): Promise<boolean> {
    // handle wallet connection
    try {
      await this.ethereum.send('eth_requestAccounts');
      return true;
    } catch (e) {
      console.info('User rejected login');
      return false;
    }
  }

  /**
   * Listen account updates
   */
  private listenAccountUpdates() {
    this.ethereum.on('accountsChanged', (accounts: string[]) => {

      if (accounts && accounts.length) {
        console.info('Accounts changed', accounts[0]);
        const loggedIn = this.loggedIn;

        this.account = accounts[0];
        this.loginEvent.emit(loggedIn);
        return;
      }

      this.localStorage.removeItem('walletConnected');
      this.account = null;
      this.web3account = undefined;
      this.loginEvent.emit(false);
    });
  }

  /**
   * Refresh dApp when the network is changed
   */
  private listenNetworkChange() {
    this.ethereum.autoRefreshOnNetworkChange = false;
    this.ethereum.on('networkChanged', () => {
      this.logout();
      this.loginEvent.emit(false);
    });
  }

  private buildWeb3(): any {
    return new Web3(new Web3.providers.HttpProvider(environment.network.provider.url));
  }
}
