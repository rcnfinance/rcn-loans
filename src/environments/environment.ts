// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  RipioCreator
}

export const environment = {
  production: false,
  url: 'http://localhost:4200/',
  envName: 'dev',
  contracts: {
    rcnToken: '0x2f45b6fb2f28a73f110400386da31044b2e953d4',
    basaltEngine: '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
    engineExtension: '0xd4cd87d5155b83eb9f3cec4c02c32df15bcde6b6',
    decentraland: {
      mortgageManager: '0x991a784b5b4374761c5d4790c5689ae775c43281',
      landMarket: '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56'
    }
  },
  dir: {
    '0x2bdf545935d4264cbb7457e97d69b6b86458eb64': Agent.MortgageCreator,
    '0xdc5fdc6d0c24573c7e2ac3896ab10e376be6da86': Agent.RipioCreator
  }
};
