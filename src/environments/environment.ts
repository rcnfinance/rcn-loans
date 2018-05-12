// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
/*
export enum Agent {
  MortgageCreator,
  RipioCreator
}

export const environment = {
  production: false,
  url: 'http://localhost:4200/',
  envName: 'dev',
  contracts: {
    rcnToken: "0x2f45b6fb2f28a73f110400386da31044b2e953d4",
    basaltEngine: "0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf",
    engineExtension: "0xd4cd87d5155b83eb9f3cec4c02c32df15bcde6b6"
  },
  dir: {
    "0x0679cde060990fb409cb19b4434714c1e5f2ae6e": Agent.MortgageCreator,
    "0xc4fbf33f1836b78c69ba748d6e3a6c5ed36bbce0": Agent.RipioCreator
  }
};
*/
export enum Agent {
  MortgageCreator,
  RipioCreator
}

export const environment = {
  production: true,
  url: 'https://rcn.loans/',
  envName: 'prod',
  contracts: {
    rcnToken: "0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6",
    basaltEngine: "0xba5a172c797c894737760aaa9e9d1558a72ace60",
    engineExtension: "0x9d4a440d0c905dfc28546e87a85eedce3ec499ee"
  },
  dir: {
    "0x263231ed9b51084816a44e18d16c0f6d0727491f": Agent.RipioCreator
  }
};