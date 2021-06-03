import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0x3afb01ba821f8edb626384acdb8e2216b2ce65a7';

export const chain = {
  network: {
    id: 80001,
    name: 'Matic',
    currency: 'MATIC',
    ui: {
      name: 'Matic',
      fullname: 'Matic Testnet Mumbai (Polygon)',
      image: 'assets/polygon.svg',
      website: 'https://docs.matic.today/docs/getting-started'
    },
    explorer: {
      address: 'https://explorer-mumbai.maticvigil.com/address/${address}/transactions',
      tx: 'https://explorer-mumbai.maticvigil.com/tx/${tx}/internal-transactions'
    },
    provider: {
      id: null,
      url: `https://rpc-mumbai.matic.today`
    }
  },
  api: {
    [Engine.UsdcEngine]: {
      v6: `https://matic-testnet.rcn.loans/`
    }
  },
  contracts: {
    [Engine.UsdcEngine]: {
      token: USDC_TOKEN,
      oracleFactory: '0x831571d93a9912830df872e3d2fc3d0ab5cbbe98',
      diaspore: {
        debtEngine: '0xbe9ab1e0fb3bd625835971cfc7bf25b493eee38b',
        loanManager: '0xb550f51b64d66dfbd4404d39c7fafd414b134de2'
      },
      collateral: {
        collateral: '0x299e2ef286632bc72dfa3c2d945330e9462da288',
        wethManager: '0xb0d54e62e8df7cee6769b19f5deb06f10680d476'
      },
      converter: {
        converterRamp: '0xc7c2faa9b3cbdb80d015d1a328c1bedac646b03e',
        uniswapConverter: '0x15b90e0a14177d50bd9fef12ee4c39927cf8bfc3'
      },
      models: {
        installments: '0x6ea0c09cbdd6e6eb3cf570d402a747422d8fec0e'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0xd0d5e3db44de05e9f294bb0a3beeaf030de24ada'
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
      'MATIC': ['MATIC', 'USD', 'USDC'],
      'ARS': ['USDC', 'USD', 'BTC', 'ARS'],
      'BTC': ['BTC', 'USD', 'USDC']
    },
    filterCurrencies: [
      'ARS',
      'USD'
    ],
    usableCurrencies: [
      {
        symbol: 'MATIC',
        img: 'assets/polygon.svg',
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
        address: '0x22d421c7bbbd54cc50c985965afec372c21fd1a1'
      }
    ],
    currencyDecimals: {
      'USDC': 6,
      'ETH': 6,
      'MATIC': 6
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
