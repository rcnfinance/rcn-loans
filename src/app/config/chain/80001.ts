import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0xf3ca289d0d94ae04ef599165c14407ba743093ae';

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
        debtEngine: '0xae781085595762d339293063f10eff2d9565eafb',
        loanManager: '0x1ae480cf2edfd194ea63dab451b39c9b0472ba0b'
      },
      collateral: {
        collateral: '0xe1aca51136dbe564a86f3c93648c6bec84df3fe7',
        wethManager: '0xecc47a8344822a541b0e7b181dbf2897fae24f88'
      },
      converter: {
        converterRamp: '0xd2c4dd1481375fc5333619a11ec96f173904cd83',
        uniswapConverter: '0x5e92cce35f1301f823fd01921f8052b51ec231b0'
      },
      models: {
        installments: '0x304cc99e29abf844d814bbc84c7f7fc4e753d266'
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
