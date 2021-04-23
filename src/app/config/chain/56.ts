import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';

export const chain = {
  network: {
    id: 56,
    name: 'Binance',
    currency: 'BNB',
    ui: {
      name: 'Binance',
      fullname: 'Binance Smart Chain (BSC)',
      image: 'assets/chain-binance.svg',
      website: 'https://academy.binance.com/en/articles/how-to-get-started-with-binance-smart-chain-bsc'
    },
    explorer: {
      address: 'https://bscscan.com/address/${address}',
      tx: 'https://bscscan.com/tx/${tx}'
    },
    provider: {
      id: null,
      url: `https://bsc-dataseed1.binance.org/`
    }
  },
  api: {
    [Engine.UsdcEngine]: {
      v6: `https://bsc-testnet.rcn.loans/` // FIXME: use mainnet API
    }
  },
  contracts: {
    [Engine.UsdcEngine]: {
      token: USDC_TOKEN,
      oracleFactory: '0x65a6d06f4077c591d65b42220b193891f08997d1',
      diaspore: {
        debtEngine: '0x89fffd110f6ab7079183159b499b744c6f252119',
        loanManager: '0x023377cc67625164420e69adf7e0d2e49f851760'
      },
      collateral: {
        collateral: '0xb44407224ae1e43cb0f419e74dd54825da27902a',
        wethManager: '' // FIXME: add contract address
      },
      converter: {
        converterRamp: '0x90642c78cf0e7b4839cc00738466a770fd0104f9',
        uniswapConverter: '0xb694a54d962014ee4476577eb6749027e5f8198f'
      },
      models: {
        installments: '0xe557f1519a3513afcd41c5a383386537eda09cb1'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee'
      },
      chainlinkAdapterV3: '0x4b3230d1aec5ac7a7750df23f11eba01d47cedb0'
    }
  },
  dir: {},
  chainlinkPairs: {
    'ETH': ['ETH', 'USD', 'USDC'],
    'BNB': ['BNB', 'USD', 'USDC'],
    'ARS': ['ARS', 'BTC', 'USD', 'USDC'],
    'BTC': ['BTC', 'USD', 'USDC']
  },
  filterCurrencies: [
    'ARS',
    'USD'
  ],
  usableCurrencies: [
    {
      symbol: 'BNB',
      img: 'assets/bnb.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      symbol: 'USDC',
      img: 'assets/usdc.png',
      address: USDC_TOKEN
    },
    {
      symbol: 'ARS',
      img: 'assets/ars.png',
      address: '0x0000000000000000000000000000000000000000'
    },
    {
      symbol: 'ETH',
      img: 'assets/eth.svg',
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
    }
  ],
  usableWallets: [
    WalletType.Metamask
  ],
  usableEngines: [
    Engine.UsdcEngine
  ],
  createLoanCurrencies: ['USDC', 'ETH', 'ARS'],
  createCollateralCurrencies: ['USDC', 'ETH']
};
