import HDWalletProvider = require('truffle-hdwallet-provider');
import Web3 = require('web3');
import bip39 = require('bip39');
import { delay } from './test-utils';

export class TestWallet {
  mnemonic: string;
  web3: Web3;
  funded = false;

  constructor() {
    this.mnemonic = bip39.generateMnemonic();
    this.web3 = new Web3(new HDWalletProvider(
        this.mnemonic,
        'https://ropsten.node.rcn.loans:8545/'
    ));
  }

  async fund(amount = '0.01') {
    const source = new Web3(new HDWalletProvider(
        process.env.FAUCET_KEY,
        'https://ropsten.node.rcn.loans:8545/'
    ));

    const saccounts = await promisify(source.eth.getAccounts, []);
    const waccounts = await promisify(this.web3.eth.getAccounts, []);
    const tx = await promisify(source.eth.sendTransaction, [{
      from: saccounts[0],
      to: waccounts[0],
      value: this.web3.toWei(amount)
    }]);
    await waitForReceipt(this.web3, tx);
  }

  async destroy(r = 0): Promise<string> {
    try {
      const source = new Web3(new HDWalletProvider(
        process.env.FAUCET_KEY,
        'https://ropsten.node.rcn.loans:8545/'
      ));

      const saccounts = await promisify(source.eth.getAccounts, []);
      const waccounts = await promisify(this.web3.eth.getAccounts, []);
      await delay(4000);
      const tx = await promisify(this.web3.eth.sendTransaction, [{
        from: waccounts[0],
        to: saccounts[0],
        value: await promisify(this.web3.eth.getBalance, [waccounts[0]]),
        gasPrice: 0
      }]);
      return tx;
    } catch {
      if (r < 30) {
        await delay(1000);
        this.destroy(r + 1);
      }
    }
  }
}

export async function waitForReceipt(web3, hash) {
  while (true) {
    const r = await promisify(web3.eth.getTransactionReceipt, [hash]);
    if (r && r.blockNumber) {
      return;
    }
    await delay(1000);
  }
}

export function promisify(func: any, args: any = []): Promise<any> {
  return new Promise((res, rej) => {
    func(...args, (err: any, data: any) => {
      if (err) { return rej(err); }
      return res(data);
    });
  });
}
