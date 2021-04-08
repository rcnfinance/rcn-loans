import { Injectable } from '@angular/core';
import * as chains from 'app/config/chain';
import { environment } from 'environments/environment';
import { AvailableChains } from 'app/interfaces/chain';

@Injectable({
  providedIn: 'root'
})
export class ChainService {
  private chainSelected: AvailableChains;
  private chainConfig: any; // TODO: mock interface
  private availableChains: AvailableChains[];
  private usingUnsupported: boolean;
  private DEFAULT_CHAIN = AvailableChains.EthMainnet;
  private KEY_LAST_CHAIN = 'lastChainSelected';

  constructor() {
    this.recoveryLastChain();
  }

  get chain() {
    return this.chainSelected;
  }

  get chains() {
    return this.availableChains;
  }

  get config() {
    return this.chainConfig;
  }

  get supported() {
    return !this.usingUnsupported;
  }

  /**
   * Load the active (or default) chain
   * @param networkVersion Chain ID
   */
  loadSelectedChain(networkVersion?: number, skipAttemp = false) {
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

    this.saveLastChain();
    if (skipAttemp) {
      return;
    }

    const { chainSelected } = this;
    if (Number(previousChainSelected) !== Number(chainSelected)) {
      window.location.reload();
    }
  }

  changeChain() {
    const { KEY_LAST_CHAIN } = this;
    localStorage.removeItem(KEY_LAST_CHAIN);
  }

  private saveLastChain() {
    const { KEY_LAST_CHAIN, chainSelected } = this;
    localStorage.setItem(KEY_LAST_CHAIN, String(chainSelected));
  }

  private recoveryLastChain() {
    const { KEY_LAST_CHAIN } = this;
    const lastChainSelected = Number(localStorage.getItem(KEY_LAST_CHAIN));
    if (lastChainSelected) {
      this.loadSelectedChain(lastChainSelected, true);
    } else {
      this.loadSelectedChain(null, true);
    }
  }
}
