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
      name: 'BSC Testnet',
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
      oracleFactory: '0x30750fcd94cdf0ab77bfeefe0f9f4ad1de50acf8',
      diaspore: {
        debtEngine: '0xca0913369415f2b05de24e824cfa7b3f2de92e54',
        loanManager: '0xd19f01537d64716d60884bcd4dbfb1d38df7d593'
      },
      collateral: {
        collateral: '0x5af05b9d79227677fe52a78d493f5703a030c2cc',
        wethManager: '0x98f0f55ffdaa90ac1a4a57854d15b66960912254'
      },
      converter: {
        converterRamp: '0x9c3d6ef4e6a6419376ec9b5d6cbb1eb3c2722578',
        uniswapConverter: '0xf7f80fc2a94fbaf08a82fe764a6be10765c8b1f0'
      },
      models: {
        installments: '0x5af05b9d79227677fe52a78d493f5703a030c2cc'
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
      'ARS': ['USDC', 'USD', 'BTC', 'ARS'],
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
