import { getBuild } from './build';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioCreator
}

declare let require: any;

const p = require('../../package.json') as any;

export const environment = {
  version: p.version,
  version_name: p.version_name,
  build: getBuild(),
  production: false,
  url: 'https://testnet.rcn.loans/',
  envName: 'dev',
  gaTracking: 'UA-122615331-2',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  version_verbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  rcn_node: {
    loan: 'https://ropsten-rnode.rcn.loans/v1/commits?id_loan=$id'
  },
  rcn_node_api: {
    url: 'http://diaspore-ropsten-rnode.rcn.loans/v4/'
  },
  rcn_oracle: {
    url: 'https://oracle.ripio.com/rate/'
  },
  network: {
    id: '3',
    name: 'Ropsten',
    explorer: {
      address: 'https://ropsten.etherscan.io/address/${address}',
      tx: 'https://ropsten.etherscan.io/tx/${tx}'
    },
    provider: 'https://ropsten-node.rcn.loans/'
  },
  contracts: {
    rcnToken: '0x2f45b6fb2f28a73f110400386da31044b2e953d4',
    basaltEngine: '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
    engineExtension: '0x3b86e29fc3e8a626735b0194aef13c6051eb6c84',
    oracle: '0xd8320c70f5d5b355e1365acdf1f7c6fe4d0d92cf',
    oracleFactory: '0xeafa9510cb980aa7ed6c740ebee28d35b0c11ff8',
    diaspore: {
      debtEngine: '0x17f910234fe7d4cb6c54601bf0cf5599b545084b',
      loanManager: '0x2694a6274906f488defc6ab2093342cddcdbdc5c',
      viewRequets: '0x7edb5117f91514579e3c8d39eed71e6be278632a',
      collateral: '0x7c5bb57001eb5bebeb0359e584dc5f29675061f2',
      filters: {
        debtCreator: '0x998a67ce5827cb372fe07942561006c7a76cf06f',
        isLender: '0x22a87c89dd8d8d0abe94062eba672f088e808d49',
        isBorrower: '0x11dad1b4b85b4ca7d03847231554571f5e7db726',
        isStatus: '0x43c6c2ae47a31e5850b820f09520310ec0481600',
        notExpired: '0xada8797ece7e2bda72140a26d13185a788a636cb'
      },
      models: {
        installments: '0xc67e7fdcbea83fb5a2bb2b60b794efff016c7cf7'
      }
    },
    converter: {
      converterRamp: '0xc76712be96b7e8937c0e4d4b760ae5002accd280',
      tokenConverter: '0xc4b1b3083174716542ef387326e58293917bf3bf',
      ethAddress: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      uniswapProxy: '0x0c295fe65e94cd4eaffe906ad1c77d9e35923b05',
      params: {
        marginSpend: 5000,
        maxSpend: 0,
        rebuyThreshold: 40000000000000000000
      }
    },
    decentraland: {
      mortgageCreator: '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
      mortgageManager: '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1',
      landMarket: '0x5424912699dabaa5f2998750c1c66e73d67ad219'
    },
    currencies: {
      rcn: '0x2f45b6fb2f28a73f110400386da31044b2e953d4',
      dai: '0x6710d597fd13127a5b64eebe384366b12e66fdb6',
      eth: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
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
  filters: {
    openLoans: '0x3e703de416a62525c8653be11d71486550618ec8',
    nonExpired: '0xe084b7cf7f6869a96cd72962047bf65e6d55e1e1',
    validMortgage: '0x93b08a8a3cf148d62c20d3daa0b1bdf813bb7a21',
    lenderIn: '0xe52eac8af912b8b3196b2921f12b66c91b39e025',
    ongoing: '0xc247ba1b89af5f2654184f0c5a8e8f1ea48c55e3'
  },
  dir: {
    '0xdc5fdc6d0c24573c7e2ac3896ab10e376be6da86': Agent.RipioCreator
  }
};
