import { AvailableChains } from 'app/interfaces/chain';
import { getBuild } from './build';

declare const require: any;
const p = require('../../package.json') as any;

export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioArsCreator,
  RipioUsdCreator
}

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
  api: {
    poh: {
      host: 'https://ipfs.kleros.io/'
    }
  },
  availableChains: [AvailableChains.EthMainnet, AvailableChains.BscMainnet, AvailableChains.MaticMainnet]
};
