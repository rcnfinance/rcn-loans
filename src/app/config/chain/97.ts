import { Agent } from 'environments/environment';
import { WalletType } from 'app/interfaces/wallet.interface';

const RCN_ENGINE = 'rcnEngine';
const RCN_TOKEN = '0x2f45b6fb2f28a73f110400386da31044b2e953d4';
const USDC_ENGINE = 'usdcEngine';
const USDC_TOKEN = '0x99c1c36dee5c3b62723dc4223f4352bbf1da0bff';

export const chain = {
  network: {
    id: 97,
    name: 'Binance',
    currency: 'BNB',
    ui: {
      name: 'Binance',
      fullname: 'Binance Smart Chain Testnet',
      image: 'assets/chain-binance.svg'
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
    [RCN_ENGINE]: {
      v6: `http://binance-test.binance-test.159.65.166.64.xip.io` // FIXME: use https
    },
    [USDC_ENGINE]: {
      v6: `http://binance-test.binance-test.159.65.166.64.xip.io` // FIXME: use https
    }
  },
  contracts: {
    [RCN_ENGINE]: {
      token: RCN_TOKEN,
      oracleFactory: '',
      diaspore: {
        debtEngine: '',
        loanManager: ''
      },
      collateral: {
        collateral: '',
        wethManager: ''
      },
      converter: {
        converterRamp: '',
        uniswapConverter: ''
      },
      models: {
        installments: ''
      }
    },
    [USDC_ENGINE]: {
      token: USDC_TOKEN,
      oracleFactory: '',
      diaspore: {
        debtEngine: '0xe8a7cd59aaa09a31af9c61e9c6da8d68a81cc198',
        loanManager: '0x4a921888cd77b5951390bc084f8dcbb3c1c3695a'
      },
      collateral: {
        collateral: '0xcdffb372f7fddd9b2d72c59951d55923424ef4e7',
        wethManager: '' // TODO: add WETH Manager for BSC
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
    decentraland: {
      mortgageCreator: '',
      mortgageManager: ''
    },
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '' // TODO: add BSC contract
      },
      chainlinkAdapterV3: '' // TODO: add BSC contract
    }
  },
  blacklist: [
    {
      key: 'oracle',
      forbidden: [
        '0x0ac18b74b5616fdeaeff809713d07ed1486d0128',
        '0x4931d0621360187199de494a1469165079b31bfc'
      ]
    },
    {
      key: 'oracleUrl',
      forbidden: [
        'http://ec2-54-233-188-146.sa-east-1.compute.amazonaws.com/rate/'
      ]
    }
  ],
  dir: {
    '0xf7c5e867e739f5508c63c8ab22f39c44b9cac0b5': Agent.RipioArsCreator,
    '0xf42d11a0aff8f9a56853e4c41ee333b57658d096': Agent.RipioArsCreator
  },
  filterCurrencies: [
    'RCN',
    'DEST',
    'ARS',
    'USD',
    'DAI'
  ],
  usableCurrencies: [
    {
      symbol: 'RCN',
      img: 'assets/rcn.png',
      address: RCN_TOKEN
    },
    {
      symbol: 'DEST',
      img: 'assets/dai.png',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    },
    {
      symbol: 'BNB',
      img: 'assets/bnb.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      symbol: 'DAI',
      img: 'assets/dai.png',
      address: '0x57ac66399420f7c99f546a5a7c00e0d0ff2679e1'
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
    }
  ],
  usableWallets: [
    WalletType.Metamask
  ]
};
