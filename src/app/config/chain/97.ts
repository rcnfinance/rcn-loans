import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0x46f348579e2b93f65fbd0636ad9cee504fcf1e1c';

export const chain = {
  network: {
    id: 97,
    name: 'Binance',
    currency: 'BNB',
    ui: {
      name: 'Binance',
      fullname: 'Binance Smart Chain (BSC) Testnet',
      image: 'assets/chain-binance.svg',
      website: 'https://academy.binance.com/en/articles/how-to-get-started-with-binance-smart-chain-bsc'
    },
    explorer: {
      address: 'https://testnet.bscscan.com/address/${address}',
      tx: 'https://testnet.bscscan.com/tx/${tx}'
    },
    provider: {
      id: null,
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`
    }
  },
  api: {
    [Engine.UsdcEngine]: {
      v6: `https://bsc-testnet.rcn.loans/`
    }
  },
  contracts: {
    [Engine.UsdcEngine]: {
      token: USDC_TOKEN,
      oracleFactory: '0x9546bb1a1af05717819e4bcb756ea95d5c9d17a4',
      diaspore: {
        debtEngine: '0xe8a7cd59aaa09a31af9c61e9c6da8d68a81cc198',
        loanManager: '0x4a921888cd77b5951390bc084f8dcbb3c1c3695a'
      },
      collateral: {
        collateral: '0xcdffb372f7fddd9b2d72c59951d55923424ef4e7',
        wethManager: '0x87bd2e005781ed72592c3dd92b71aa9ada0bba5b'
      },
      converter: {
        converterRamp: '0x280fd3b6ff59e76297c874db7fe2b98175737041',
        uniswapConverter: '0xdba056aba9735cb3ad54f822a7d7fbe6c5ca31f5'
      },
      models: {
        installments: '0x99aca996ebbf0fe42c45379277dc34fd9d83d4fc'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0x2514895c72f50d8bd4b4f9b1110f0d6bd2c97526'
      },
      chainlinkAdapterV3: '0x774d446f17619c66d0feb5856f7a6bb93ac2b6c1'
    }
  },
  dir: {
    '0xf7c5e867e739f5508c63c8ab22f39c44b9cac0b5': Agent.RipioArsCreator,
    '0xf42d11a0aff8f9a56853e4c41ee333b57658d096': Agent.RipioArsCreator
  },
  currencies: {
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
        address: '0xc1bd46297effa98c87b2f74ada2903ec0f804e1c'
      }
    ],
    currencyDecimals: {
      'USDC': 18
    },
    createLoanCurrencies: ['USDC', 'ETH', 'ARS'],
    createCollateralCurrencies: ['USDC', 'ETH']
  },
  usableWallets: [
    WalletType.Metamask
  ],
  usableEngines: [
    Engine.UsdcEngine
  ]
};
