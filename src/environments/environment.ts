import { getBuild } from './build';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioArsCreator,
  RipioUsdCreator
}

declare let require: any;

const p = require('../../package.json') as any;

const INFURA_ID = 'acf3c538f57040839369e7c1b023c3c6';
const API_BASE = 'https://diaspore-ropsten-rnode.rcn.loans';
const RCN_ENGINE = 'rcnEngine';
const RCN_TOKEN = '0x2f45b6fb2f28a73f110400386da31044b2e953d4';
const USDC_ENGINE = 'usdcEngine';
const USDC_TOKEN = '0x99c1c36dee5c3b62723dc4223f4352bbf1da0bff';

export const environment = {
  version: p.version,
  versionName: p.version_name,
  versionEmoji: '👻',
  build: getBuild(),
  production: false,
  url: 'https://testnet.rcn.loans/',
  envName: 'dev',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  versionVerbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  gaTracking: 'UA-122615331-2',
  apiCountry: 'https://ipcountry-api.rcn.loans',
  network: {
    id: 3,
    name: 'Ropsten',
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
    [RCN_ENGINE]: {
      v4: `${ API_BASE }/v4/`,
      v5: `${ API_BASE }/v5/`,
      v6: `https://old-api-ropsten-diaspore.rcn.loans/`
    },
    [USDC_ENGINE]: {
      v6: `https://new-api-ropsten-diaspore-usdc.rcn.loans/`
    }
  },
  contracts: {
    [RCN_ENGINE]: {
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
        ethAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        uniswapConverter: '0x32657d6f2dcb32a5129d14db4a2e2e6fb198ce07'
      },
      models: {
        installments: '0x41e9d0b6a8ce88989c2e7b3cae42ecfac44c9603'
      }
    },
    [USDC_ENGINE]: {
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
        ethAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        uniswapConverter: '0x32657d6f2dcb32a5129d14db4a2e2e6fb198ce07'
      },
      models: {
        installments: '0x1bec6de76544ab982c4a137136d15a0b6d9398a4'
      }
    },
    ethAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decentraland: {
      mortgageCreator: '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
      mortgageManager: '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1'
    },
    chainlink: {
      EACAggregatorProxy: {
        ethUsd: '0x30b5068156688f818cea0874b580206dfe081a03'
      }
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
    'MANA',
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
      img: 'assets/mana.png', // TODO: use ARS logo
      address: '0x0000000000000000000000000000000000000000'
    }
  ]
};
