import { Injectable } from '@angular/core';
import * as chains from 'app/config/chain';
import { environment } from 'environments/environment';
import { AvailableChains } from 'app/interfaces/chain';
import { WalletType } from 'app/interfaces/wallet.interface';

@Injectable({
  providedIn: 'root'
})
export class ChainService {
  private chainSelected: AvailableChains;
  private chainConfig: any; // TODO: mock interface
  private availableChains: AvailableChains[];
  private availableWallets: WalletType[];
  private usingUnsupported: boolean;
  private DEFAULT_CHAIN = AvailableChains.EthMainnet;
  private KEY_LAST_CHAIN = 'lastChainSelected';

  constructor() {
    this.loadAvailableChains();
    this.recoveryLastChain();
  }

  get chain() {
    return this.chainSelected;
  }

  get chains() {
    return this.availableChains;
  }

  get wallets() {
    return this.availableWallets;
  }

  get config() {
    return this.chainConfig;
  }

  get supported() {
    return !this.usingUnsupported;
  }

  /**
   * Check if the current chain is Ethereum
   */
  get isEthereum() {
    const { chain } = this;
    return [AvailableChains.EthMainnet, AvailableChains.EthRopsten].includes(chain);
  }

  /**
   * Load the active (or default) chain
   * @param networkVersion Chain ID
   */
  loadSelectedChain(networkVersion?: number, skipAttemp = false): void {
    const { chainSelected: previousChainSelected } = this;
    try {
      const { availableChains } = environment;
      const chainId = Number(networkVersion);
      if (!availableChains.includes(chainId)) {
        throw Error('Network not supported');
      }

      const { chain } = chains.default[chainId as AvailableChains];
      this.chainSelected = chainId;
      this.chainConfig = chain;
      this.usingUnsupported = false;
    } catch (err) {
      const { DEFAULT_CHAIN } = this;
      const { chain } = chains.default[DEFAULT_CHAIN];
      const { ethereum: usingWallet } = window as any;
      this.chainSelected = DEFAULT_CHAIN;
      this.chainConfig = chain;
      this.usingUnsupported = usingWallet ? true : false;
      console.warn(err);
    }

    this.loadAvailableWallets();
    this.saveLastChain();
    if (skipAttemp) {
      return;
    }

    const { chainSelected } = this;
    if (Number(previousChainSelected) !== Number(chainSelected)) {
      window.location.reload();
    }
  }

  /**
   * Get chain config by chain ID
   * @param chainId Chain ID (ex: ETH Mainnet = 3, Ropsten = 3)
   * @return Chain config
   */
  getChainConfigById(chainId: AvailableChains): any {
    // TODO: replace any by chain-config interface
    try {
      const { chain } = chains.default[chainId];
      return chain;
    } catch (err) {
      return null;
    }
  }

  /**
   * Load available chains to use
   */
  private loadAvailableChains() {
    const { availableChains } = environment;
    this.availableChains = availableChains;
  }

  /**
   * Load available wallets to use
   */
  private loadAvailableWallets() {
    const { usableWallets } = this.config;
    this.availableWallets = usableWallets;
  }

  /**
   * Save the current chain as last used
   */
  private saveLastChain(): void {
    const { KEY_LAST_CHAIN, chainSelected } = this;
    localStorage.setItem(KEY_LAST_CHAIN, String(chainSelected));
  }

  /**
   * Recover the last used chain
   */
  private recoveryLastChain(): void {
    const { KEY_LAST_CHAIN } = this;
    const lastChainSelected = Number(localStorage.getItem(KEY_LAST_CHAIN));
    if (lastChainSelected) {
      this.loadSelectedChain(lastChainSelected, true);
    } else {
      this.loadSelectedChain(null, true);
    }
  }
}
