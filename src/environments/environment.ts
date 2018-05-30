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
  network: {
    id: '3',
    name: 'Ropsten',
    provider: 'http://ec2-18-221-133-10.us-east-2.compute.amazonaws.com:8545/'
  },
  contracts: {
    rcnToken: '0x2f45b6fb2f28a73f110400386da31044b2e953d4',
    basaltEngine: '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
    engineExtension: '0x9a2fded5ab51458c203ef5747b9a88d33fc1f032',
    decentraland: {
      mortgageCreator: '0x2bdf545935d4264cbb7457e97d69b6b86458eb64',
      mortgageManager: '0xea06746f1bd82412f9f243f6bee0b8194d67a67d',
      landMarket: '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56'
    }
  },
  dir: {
    '0x2bdf545935d4264cbb7457e97d69b6b86458eb64': Agent.MortgageCreator,
    '0xdc5fdc6d0c24573c7e2ac3896ab10e376be6da86': Agent.RipioCreator
  }
};
