import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0xf3ca289d0d94ae04ef599165c14407ba743093ae';

export const chain = {
  network: {
    id: 80001,
    name: 'Polygon',
    currency: 'MATIC',
    ui: {
      name: 'Polygon Testnet',
      fullname: 'Polygon Testnet Mumbai',
      image: 'assets/polygon.svg',
      website: 'https://docs.matic.today/docs/getting-started',
      bridge: 'https://wallet.matic.network/bridge'
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
        wethManager: '0xf2bdbe466415cfdafc1f0e45578ecb62b56d99ad'
      },
      converter: {
        converterRamp: '0xd99cdb40f36975c33768a23794b542dfd7cb4537',
        uniswapConverter: '0x236cde7d670ca811330c7cd7e7b21fef56e25798'
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
        address: '0xd54dbbb55cc55d87a92f25f1c883b296de75cdcb'
      }
    ],
    currencyDecimals: {
      'USDC': 6
    },
    createLoanCurrencies: ['USDC', 'ETH', 'MATIC', 'ARS'],
    createCollateralCurrencies: ['USDC', 'ETH']
  },
  usableWallets: [
    WalletType.Metamask
  ],
  usableEngines: [
    Engine.UsdcEngine
  ]
};
