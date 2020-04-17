# Changelog

## Unreleased

### Feature:
- Show my borrowed and lent loans
- Installments and payments details
- Borrow loans with Collateral

## **0.1.3** Boggart 👻

### Enhancement:
- Add copy for release
- Update metatags
- Exclude diaspore loans with inconsistent information from requests and activity

## **0.1.2** Boggart 👻

### Feature:
- Connect to the dApp with multiple wallets

### Enhancement:
- Update of texts and contents
- New UI for small dialogs (wrong country, funds, Metamask and generic)
- Upgrade Web3 to 1.x

## **0.1.1** Boggart 👻 - 2020/02/17

### Feature:
- Lend Ripio Credit loans using a cosigner

### Enhancement:
- Update of texts and contents
- Adjust filter component and loan detail styles

### Fix:
- Update mainnet contract addresses

## **0.1.0** Boggart 👻 - 2020/02/03

### Feature:

- Display Diaspore RCN Engine loans
- Show Lending Checkout Dialog, lend using another currency
- New Material Dark Theme
- Improving Restricted Region Dialog
- Auto-generate technical documentation for each release
- Implement the contracts TokenConverter and MultiOracle

### Enhancement:

- Visual improvements
- Get basalt loans using the API
- Different payment and lend flows for Basalt loans
- Updated error views (404, no more loans, connection error)
- New originators visual grid for description
- New balance account and withdraw panel
- New look for the payment checkout, transfer and settings dialog
- Open all addresses in etherscan.io
- Upgrade error and event tracking lib from Raven to Sentry
- Upgrade Angular and CDK to 8.x
- Implement lazy loading modules strategy
- Implement virtual scroll for long lists
- Update of texts and contents

### Fix:

- Fix spinners when changing pages
- Fix loans filter in Activity view
- Netlify build, use Node 12

## **0.0.13** Avocados - 2019/02/15

### Feature:
- Add support to deploy Dapp to ipfs network
- Add ipfs-deploy script

### Fix:

- Fix scrollbar style
- Api Fix Geolocalization
- Fix Civic QR CSS
- Improve SEO
- Fix activity duration title bug

## **0.0.12** Avocados - 2019/01/09

### Features:
- Notification Component

### Misc:
- Use Roboto font for number display
- Increase extra ETH send from 3% to 5%
- Increase min rebuy to 40 RCN

### Fix:
- Fix bug when view card-loan type visibility
- Fix bug when approve contract checkbox visibility

## **0.0.11** Avocados - 2018/12/25

### Features:
- Added pay loan option
- Lend using ETH if user has no RCN balance
- Filter loan requests by currency, amount, interest rates and duration
- Added Discord to Footer Component

### Misc:
- Setup unit tests
- Setup e2e tests

### Fix:
- Fix bug when loading metamask privacy on account detail
- Fix try to lend an invalid mortgage request
- Fix bug when the request is expired, the estimated return of a loan shows an incorrect amount
- Fix margin "This address is not a lender" message

## **0.0.10-D** Avocados - 2018/11/14

### Features:
- Added support for Metamask privacy mode

### Misc:
- Display correct status on expired loans
- Update Decentraland mortgages contracts
- Hide the transfer button on paid loans

## **0.0.10** Avocados - 2018/10/30

### Changes:
- Add transfer loan ownership button
- New Decentraland cosigner detail
- Added loading spinner to transaction history

### Misc:
- Migrated to Bootstrap V4
- Refactor requests component

### Fixes:
- Fix display version footer
- Fix transaction history display
- Fix display claim button, cosigner
- Fix validate Oracle, address(0)
- Fix font size, interest rate
- Fix transaction history icons

## **0.0.9** Avocados - 2018/09/18

### Features:
- Added snackbar notification for ethereum transactions
- Set-up Decentraland contracts

### Fixes:
- Fix back button in loan detail
- Fix 404 page not displaying
- Fix build number tooltip

## **0.0.8** Avocados - 2018/08/24

### Features:
- Display loan history
- New navigation loan detail
- Added Sentry integration
- Added Google Analytics integration
- Filter allowed countries
- Now using Angular 6
- Display error messages
- Show feedback performing heavy operations

### Fixes:
- Fix Civic dialog
- Responsive mobile fixes
- Fix production build
- Fix Meta OG Tracking Facebook / Twitter
- Fix poor visibility of the approve contract checkbox
- Fix limit size of the duration label

## **0.0.7** Avocados - 2018/07/10

- Not enough funds dialog
- 404 page
- Show Oracle in loan detail
- Meta OG for sharing
- New Decentraland API Scheme
- Replaced Decentraland API URL
- Added new Mortgage Creator
- Responsive improvements
- Bug fixes

## **0.0.6** Avocados - 2018/06/25

- New sidebar and navigation bar
- Improvements in mobile navigation
- Ability to claim liabilities from cosigners
- Activity tab with all the active loans
- Refactor in cosigner service, created cosigner 'Providers'
- Upgraded API for Decentraland
- Replaced Decentraland canvas by its new map API
