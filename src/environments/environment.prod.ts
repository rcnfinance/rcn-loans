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
const API_BASE = 'https://diaspore-rnode.rcn.loans';
const RCN_ENGINE = 'rcnEngine';
const RCN_TOKEN = '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6';
const USDC_ENGINE = 'usdcEngine';
const USDC_TOKEN = '';

export const environment = {
  version: p.version,
  versionName: p.version_name,
  versionEmoji: '👻',
  build: getBuild(),
  production: true,
  url: 'https://mainnet.rcn.loans/',
  envName: 'main',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  versionVerbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  gaTracking: 'UA-158285508-1',
  apiCountry : 'https://ipcountry-api.rcn.loans',
  network: {
    id: 1,
    name: 'Main',
    explorer: {
      address: 'https://etherscan.io/address/${address}',
      tx: 'https://etherscan.io/tx/${tx}'
    },
    provider: {
      id: INFURA_ID,
      url: `https://mainnet.infura.io/v3/${ INFURA_ID }`
    }
  },
  api: {
    [RCN_ENGINE]: {
      v4: `${ API_BASE }/v4/`,
      v5: `${ API_BASE }/v5/`,
      v6: `` // TODO: add
    },
    [USDC_ENGINE]: {
      v6: `` // TODO: add
    }
  },
  contracts: {
    [RCN_ENGINE]: {
      token: RCN_TOKEN,
      oracleFactory: '', // TODO: add
      diaspore: {
        debtEngine: '', // TODO: add
        loanManager: '' // TODO: add
      },
      collateral: {
        collateral: '', // TODO: add
        wethManager: '' // TODO: add
      },
      converter: {
        converterRamp: '', // TODO: add
        ethAddress: '', // TODO: add
        uniswapConverter: '' // TODO: add
      },
      models: {
        installments: '' // TODO: add
      }
    },
    [USDC_ENGINE]: {
      token: USDC_TOKEN,
      oracleFactory: '', // TODO: add
      diaspore: {
        debtEngine: '', // TODO: add
        loanManager: '' // TODO: add
      },
      collateral: {
        collateral: '', // TODO: add
        wethManager: '' // TODO: add
      },
      converter: {
        converterRamp: '', // TODO: add
        ethAddress: '', // TODO: add
        uniswapConverter: '' // TODO: add
      },
      models: {
        installments: '' // TODO: add
      }
    },
    ethAddress: '', // TODO: add
    decentraland: {
      mortgageCreator: '', // TODO: add
      mortgageManager: '' // TODO: add
    },
    chainlink: {
      EACAggregatorProxy: {
        ethUsd: '' // TODO: add
      }
    }
  },
  blacklist: [],
  dir: {
    '0xfbd5e54062619ef2b0323ad9ff874b39fd5a8d2c': Agent.RipioArsCreator,
    '0x520aefcaea7754e86c2a1c9367948d732607c47f': Agent.RipioUsdCreator
  },
  filterCurrencies: [
    'RCN',
    'DAI',
    'MANA',
    'ARS',
    'USD'
  ],
  usableCurrencies: [
    {
      symbol: 'RCN',
      img: 'assets/rcn.png',
      address: RCN_TOKEN
    },
    {
      symbol: 'ETH',
      img: 'assets/eth.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      symbol: 'DAI',
      img: 'assets/dai.png',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f'
    },
    {
      symbol: 'USDC',
      img: 'assets/usdc.png',
      address: USDC_TOKEN
    },
    {
      symbol: 'MANA',
      img: 'assets/mana.png',
      address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
    }
  ]
};
