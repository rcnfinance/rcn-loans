import { Agent } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const INFURA_ID = 'acf3c538f57040839369e7c1b023c3c6';
const RCN_TOKEN = '0x2f45b6fb2f28a73f110400386da31044b2e953d4';
const USDC_TOKEN = '0x99c1c36dee5c3b62723dc4223f4352bbf1da0bff';

export const chain = {
  network: {
    id: 3,
    name: 'Ropsten',
    currency: 'ETH',
    ui: {
      name: 'Ropsten',
      fullname: 'Ethereum Ropsten',
      image: 'assets/chain-ethereum.svg',
      website: 'https://ethereum.org/en/'
    },
    explorer: {
      address: 'https://ropsten.etherscan.io/address/${address}',
      tx: 'https://ropsten.etherscan.io/tx/${tx}'
    },
    provider: {
      id: INFURA_ID,
      url: `https://ropsten.infura.io/v3/${ INFURA_ID }`
    }
  },
  api: {
    [Engine.RcnEngine]: {
      v6: `https://old-api-ropsten-diaspore.rcn.loans/`
    },
    [Engine.UsdcEngine]: {
      v6: `https://new-api-ropsten-diaspore-usdc.rcn.loans/`
    }
  },
  contracts: {
    [Engine.RcnEngine]: {
      token: RCN_TOKEN,
      oracleFactory: '0x9778acc25e8355ddcd7f5c23ca259a5eafffbd29',
      diaspore: {
        debtEngine: '0xb2403dca04ab49492e1e05b29f26e6c01ac5d604',
        loanManager: '0x39e67f667ed83c8a2db0b18189fe93f57081b9ae'
      },
      collateral: {
        collateral: '0xe4fb51318cd67bfc48f294e46eb18ec0b5b2674c',
        wethManager: '0xFcbFD18D28ff0FfB311e2dE179F3758531128449'
      },
      converter: {
        converterRamp: '0x9ce962dfaa5cefcbe298c5a469487cead3a0640d',
        uniswapConverter: '0x32657d6f2dcb32a5129d14db4a2e2e6fb198ce07'
      },
      models: {
        installments: '0x41e9d0b6a8ce88989c2e7b3cae42ecfac44c9603'
      }
    },
    [Engine.UsdcEngine]: {
      token: USDC_TOKEN,
      oracleFactory: '0x8c6ec1b870a15f6156ba44841939ea4ed0f480fd',
      diaspore: {
        debtEngine: '0x8412d235a7e4d9ba20ffa2e5585dae96a88ad0b5',
        loanManager: '0x3938155d5782b83cbf23fc325a19746ad7d6ba43'
      },
      collateral: {
        collateral: '0xe404a7a3bf4b0ad2d18865de2064c78e255814d1',
        wethManager: '0x0728610fd8034d08ea4c5848c4e4bbaa17f3c650'
      },
      converter: {
        converterRamp: '0x935b3a5bc4d41b8ac1632faac86e3ef1c556921e',
        uniswapConverter: '0x32657d6f2dcb32a5129d14db4a2e2e6fb198ce07'
      },
      models: {
        installments: '0x1bec6de76544ab982c4a137136d15a0b6d9398a4'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0x30b5068156688f818cea0874b580206dfe081a03'
      },
      chainlinkAdapterV3: '0x62e2d0a55f4d5f19546b32e0ecde19ef6d290962'
    }
  },
  dir: {
    '0xf7c5e867e739f5508c63c8ab22f39c44b9cac0b5': Agent.RipioArsCreator,
    '0xf42d11a0aff8f9a56853e4c41ee333b57658d096': Agent.RipioArsCreator
  },
  currencies: {
    chainlinkPairs: {
      'ETH': ['ETH', 'USDC'],
      'RCN': ['RCN', 'BTC', 'ETH', 'USDC'],
      'ARS': ['USDC', 'ETH', 'BTC', 'ARS'],
      'BTC': ['BTC', 'ETH', 'USDC']
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
        symbol: 'ETH',
        img: 'assets/eth.png',
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
    currencyDecimals: {
      'USDC': 6
    },
    createLoanCurrencies: ['RCN', 'USDC', 'ARS'],
    createCollateralCurrencies: ['RCN', 'USDC']
  },
  usableWallets: [
    WalletType.Metamask,
    WalletType.WalletConnect,
    WalletType.WalletLink
  ],
  usableEngines: [
    Engine.RcnEngine, Engine.UsdcEngine
  ]
};
