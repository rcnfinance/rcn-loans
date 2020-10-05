import { Component, OnInit } from '@angular/core';
interface Faq {
  question: string;
  answer: string;
}
interface FaqGroup {
  title: string;
  faqs: Faq[];
}

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  faqs: Faq[];
  faqGroups: FaqGroup[];
  panelOpenState: {[id: number]: boolean} = {};

  constructor() { }

  ngOnInit() {
    this.faqGroups = [{
      title: 'General',
      faqs: [{
        question: 'What is RCN?',
        answer: 'RCN is an open-source global credit network that connects lenders, borrowers and originators on the blockchain to create frictionless, transparent and borderless loan markets.'
      }, {
        question: 'How does RCN work?',
        answer: `RCN is powered by an open-source blockchain lending and borrowing protocol which runs on the <a href="https://ethereum.org/en/" target="_blank">Ethereum network</a>. Composed by a modular set of smart-contracts, the protocol’s current version (named <a href="https://medium.com/rcnblog/rcn-protocol-v4-diaspore-7073739fbeda" target="_blank">RCN Protocol v4.0 “Diaspore"</a>) operates funds exclusively in RCN's native token and enables its users to lend, borrow, collateralize, transfer and repay loans. In addition, it is compatible with a wide variety of oracles, loan types and backings.`
      }, {
        question: 'What is the RCN Token and how is it related to RCN?',
        answer: 'The RCN Token is an ERC-20 token and Ethereum smart-contract. It is a vehicle that allows users to denominate, fund, collateralize, repay and collect loans on the RCN protocol.'
      }]
    }, {
      title: 'Credit Marketplace',
      faqs: [{
        question: 'What is the RCN Credit Marketplace?',
        answer: 'The RCN Credit Marketplace is a proprietary Decentralized Application (dApp) that allows users to access the RCN protocol and connect with its features. By combining digital lending and borrowing tools with all the transparency and security of the blockchain, the RCN Credit Marketplace enables creditors to lend Decentralized Finance (DeFi) and Centralized Finance (CeFi) loans, borrow Peer-To-Peer (P2P) loans and manage everything in one place.'
      }, {
        question: 'Which are the RCN Credit Marketplace’s main advantages?',
        answer: `The RCN Credit Marketplace presents several features and qualities that make it stand out from the rest of the blockchain lending ecosystem, including the following:

• Support for both DeFi & CeFi loans, allowing creditors to access multiple lending alternatives without leaving the platform.

• Support for multiple crypto and fiat currencies.

• Non-custodial management of funds and login using multiple available wallets.

• Lending and borrowing with predetermined and fixed interest rates, amounts and durations.

• Absence of spreads between lending and borrowing interest rates, enabled by a P2P lending system.

• Absence of platform-related fees and other additional transaction costs, besides “gas” payments requested by the Ethereum network.
`
      }, {
        question: 'Is the RCN Credit Marketplace enabled worldwide?',
        answer: 'No. You should not use the RCN Credit Marketplace if it is or could be subject to any regulations or authorizations in your jurisdiction.'
      }, {
        question: 'How do I connect my wallet to the Credit Marketplace?',
        answer: `In order to connect your wallet using a desktop browser, access the <a href="https://rcn.market/" target="_blank">RCN Credit Marketplace</a>, go to the upper right corner of the screen and click on “Connect”. When the pop-up dialog appears, pick your wallet of choice from the available alternatives. Finally, follow the instructions on your wallet’s pop-up dialog to complete the process.

If you are using a mobile or in-wallet browser instead, you will find the “Connect” button at the bottom of the screen.

If you don’t have an Ethereum wallet yet, please create one using <a href="https://medium.com/rcnblog/introducing-multi-wallet-login-fbdbb3bdb170" target="_blank">any of the available options</a>.`
      }, {
        question: 'How can I access the different sections and tools of the Credit Marketplace?',
        answer: `The RCN Credit Marketplace has several sections and tools which can be accessed using its navigation menu, located on the upper right corner of the screen in desktop browsers or at the bottom of the screen in mobile or in-wallet browsers. These include the following:

• The <a href="https://rcn.market/borrow" target="_blank">Borrow</a> section, which enables users to request loans choosing the currency, amount, duration, interest rate and collateralization ratio.

• The <a href="https://rcn.market/lend" target="_blank">Lend</a> section, which allows users to browse through the available Requested Loans, find the most suitable for them and fund them.

• The <a href="https://rcn.market/activity" target="_blank">Activity</a> section, which gives users the freedom to explore all the Credit Marketplace’s Outstanding, Overdue and Repaid loans.

• The My Loans section, which lets users keep track of their requested and funded loans, verify their status and follow their repayment schedule.

• The Notifications tool, which keeps track of a connected wallet’s latest transactions on the Credit Marketplace.

• The Wallet Balance tool, which allows users to see their connected wallet’s balances for all the cryptocurrencies supported by the Credit Marketplace.

• The Withdrawable Balance tool, which shows users the principal and interest already repaid to them and allows them to withdraw the funds.

• The General Settings tool, which displays the address and provider of the users’ connected wallet and allows them to enable or disable it to interact with the RCN Protocol’s smart-contracts.
`
      }, {
        question: 'How can I get support in case I have an issue?',
        answer: 'If you have any issues, questions, comments or suggestions you can get support reaching out to the community on <a href="https://t.me/RCNchat" target="_blank">Telegram</a>, or contacting the Credit Marketplace’s development team via mail at helpdesk@rcn.finance.'
      }]
    }, {
      title: 'Lending',
      faqs: [{
        question: 'Which are the different types of loans available on the Credit Marketplace?',
        answer: `The RCN Credit Marketplace allows creditors to access multiple lending alternatives, including both DeFi & CeFi loans. These are the main differences between them:

• DeFi (Decentralized Finance) P2P loans are requested by retail borrowers within the crypto ecosystem. They are denominated in cryptocurrencies and backed by crypto-collateral locked in a smart-contract. The funds obtained through them are usually employed to finance the borrowers’ leveraged investments.

• CeFi (Centralized Finance) loans are requested by Originators, economic entities that exist beyond the crypto ecosystem. They are denominated in either fiat or crypto currencies, and backed by their borrower’s reputation. The funds obtained through them are usually applied to satisfy the Originators’ general financial requirements.`
      }, {
        question: 'Which is the most important information to consider before funding a loan?',
        answer: `There are several pieces of information that lenders should consider before deciding to fund a loan, all of which can be found on the loan’s Detailed View. These include the following:

• The Borrower’s Ethereum wallet address, accompanied by a description and a set of relevant facts about it.

• The Borrowing Currency, which is the currency in which the loan and its interests are denominated.

• The Annual Rate (short for Annual Percentage Rate or APR), which is the annualized interest rate paid by the borrower and earned by the lender for funding the loan (without taking compound interest into account).

• The Penalty Rate, which is the interest rate that replaces the Annual Rate in CeFi loans once the Due Date has passed and the loan’s status has changed to Overdue. This rate is applied to both the principal and the interest accrued until that moment.

• The Lend amount, which is the amount the lender has to deposit in order to fund the loan, denominated in the Borrowing Currency. This amount can also be seen expressed in the chosen Lending Currency on the Loan Lending dialog.

• The Receive amount, which is the amount of capital plus interest the lender will receive for funding the loan, denominated in the Borrowing Currency. A possible value for this amount can also be seen expressed in the chosen Lending Currency on the Loan Lending dialog.

• The Duration, which indicates the amount of time the borrower has in order to repay the loan before its status changes to Overdue, and the Penalty Rate replaces the Annual Rate.

• The Instalments Schedule, which indicates the number, date and amount of the payments in which the Receive amount will be repaid. Each of these payments represents/implies another due date in the loan’s repayment schedule.

• The Oracle, represented by its Ethereum address, which supplies the exchange rate used to calculate the equivalence between amounts denominated in the Borrowing and Lending Currencies.

• The Collateral Status, which offers several indicators related to the loan’s collateral, including the following:

  ◦ Collateral Amount, the amount of funds currently collateralized.

  ◦ Collateral Ratio, the proportion between the value of the collateral and the value of the borrowed funds.

  ◦ Liquidation Ratio, the value of the Collateral Ratio at which the collateral will get partially or fully liquidated.

  ◦ Safety Ratio, the value the Collateral Ratio will reach after a collateral liquidation.

  ◦ Current Exchange Rate, between the Collateralization Currency and the Borrowing Currency.

  ◦ Liquidation Exchange Rate, the exchange rate at which the Collateral Ratio will reach the Liquidation Ratio.

All these variables are set by the borrower as part of the loan requesting process, except for the Oracle, the Liquidation Ratio and the Safety Ratio.
`
      }, {
        question: 'Which Lending Currencies can I use to fund a loan?',
        answer: 'Every loan on the RCN Credit Marketplace can be funded using one of many Lending Currencies, including RCN, ETH, DAI, USDC or MANA.'
      }, {
        question: 'In which Repayment Currency is the Receive amount paid in?',
        answer: 'All loans are repaid using RCN, which is the RCN Credit Marketplace’s only Repayment Currency.'
      }, {
        question: 'How can exchange rate fluctuations between the Borrowing and Lending Currencies affect the Receive amount?',
        answer: `While loans on the RCN Credit Marketplace can be funded in several Lending Currencies, they are always denominated in their Borrowing Currency. This means that while the Receive amount expressed in the Borrowing Currency is constant, if the exchange rate between a loan’s Borrowing and Lending Currencies fluctuates during its term, the Receive amount expressed in the Lending Currency will be different than the one originally estimated on the Loan Lending dialog. This can produce two different results, depending on how the exchange rate varies:

• If the exchange rate decreases, and the value of the Borrowing Currency (measured in the Lending Currency) at the end of the term is higher than the value at the beginning, the Receive amount expressed in the Lending Currency will be higher than the one originally estimated.

• If the exchange rate increases, and the value of the Borrowing Currency (measured in the Lending Currency) at the end of the term is lower than the value at the beginning, the Receive amount expressed in the Lending Currency will be lower than the one originally estimated.

In this second case, if the fluctuation is big enough, the Receive amount in the Lending Currency might end up being lower than the original Lend amount.`
      }, {
        question: 'How can I find the most suitable loans for me?',
        answer: 'You can find the most suitable loans for you more easily using the tools on the <a href="https://rcn.market/lend" target="_blank">Lend</a> section, which will allow you to filter them by Borrowing Currency, Lend amount, Duration and Annual Rate, and sort them by Receive amount, Annual Rate or Penalty Rate.'
      }, {
        question: 'How do I fund a loan?',
        answer: 'In order to fund a loan go to the <a href="https://rcn.market/lend" target="_blank">Lend</a> section, choose the one you want to fund and click on it to access its Detailed View. Once you have verified its terms and made sure you understood them, click on the “Lend” button. When the pop-up dialog appears, choose the Lending Currency you want to fund the loan with and verify the Lend amount and the Receive amount in both the Lending Currency and the Borrowing Currency. Bear in mind that while the Receive Amount in the Borrowing Currency is not affected by exchange rate fluctuations, the one shown in the Lending Currency is, which means it can only be estimated. Finally, click on the “Lend” button, confirm the transaction on your wallet’s pop-up dialog and wait until the loading bar indicates that the process is complete. Once it is, you will be able to see your newly funded loan on the My Loans section.'
      }, {
        question: 'Can I partially fund a loan?',
        answer: 'No, in order to fund a loan you will have to deposit the full Lend amount.'
      }, {
        question: 'What do the different Loan status mean?',
        answer: `All loans display a status which varies through their life cycle and offers important information about them. These include the following:

• A Requested status, which indicates that the loan has been requested by a borrower but not yet funded. Requested Loans give information about their duration but not about specific repayment dates, since those cannot be established until the loan has been funded.

• An Ongoing status, which indicates that the loan has been funded but not yet repaid. Ongoing Loans show their due dates and the time remaining until they arrive.

• An Overdue status, which indicates that one of the loan’s due dates has gone by without the loan being fully repaid. Overdue Loans show their due dates and the time passed since them. This status is only applicable to CeFi loans.

• A Repaid status, which indicates that the loan has been fully repaid.`
      }, {
        question: 'What happens if a loan is not repaid on time?',
        answer: `The consequences of a loan not being repaid by the time one of its due dates arrives depend on whether it is a DeFI or a CeFi loan:

• If a DeFi loan is not repaid on time its collateral will get partially or totally liquidated to repay the accrued debt. In order to preserve the collateral’s role as the lender’s protection against default, a partial or total collateral liquidation and debt repayment will also take place if the Collateral Ratio reaches the Liquidation Ratio. While a DeFi loan’s status will never change to Overdue, if the repayment is total the status will change to Repaid and no further debt will be accrued.

• If a CeFi loan is not repaid on time, its status will change to Overdue and the Penalty Rate will replace the Annual Rate as the loans’ interest rate. This rate will be applied to both the principal and the interest accrued so far. When the loan’s accrued debt is repaid, the status will change back to Outstanding and the Annual Rate will be reinstated. If the repayment is total, the status will change to Repaid and no further debt will be accrued.`
      }, {
        question: 'How do I withdraw my repaid funds?',
        answer: 'Once your funded loan reaches the Repaid status, you will be able to verify and collect your capital plus interest by clicking on the Withdrawable Balance tool, located at the upper right corner of the screen in desktop browsers or at the bottom of the screen in mobile or in-wallet browsers. After approving your wallet’s transaction, the accrued funds from all your Repaid loans will be transferred to your address.'
      }, {
        question: 'Can I fund loans using my previous unwithdrawn repaid funds?',
        answer: 'No, in order to fund a loan using your previously repaid funds you will first have to withdraw them from your Withdrawable Balance to your wallet.'
      }, {
        question: 'Where can I keep track of my funded loans?',
        answer: 'You can see all your funded loans and keep track of their current status, repayment schedule and Loan History (which includes information about all their previous status’ changes) by clicking on them on the My Loans section.'
      }]
    }];
  }

  getId(groupIndex: number, faqIndex: number) {
    return `${groupIndex}${faqIndex}`;
  }
}
