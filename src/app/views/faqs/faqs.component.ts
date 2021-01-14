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
        answer: `RCN is powered by its own open-source blockchain lending and borrowing protocol, which in turn runs on the <a href="https://ethereum.org/en/" target="_blank">Ethereum network</a>. Composed by a modular set of smart-contracts, the protocol’s current version <a href="https://medium.com/rcnblog/rcn-protocol-v4-diaspore-7073739fbeda" target="_blank">RCN Protocol v4.0 “Diaspore"</a> allows its users to denominate, collateralize, receive, repay, fund, transfer and collect loans. In addition, it is compatible with a wide variety of Oracles, Loan Types and Backings.`
      }, {
        question: 'What is the RCN Token and how is it related to RCN?',
        answer: 'The RCN Token is an ERC-20 token, Ethereum smart-contract, and one of the currencies that allows users to receive, repay and collect loans on the RCN protocol.'
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
        question: 'How can I connect my wallet to the Credit Marketplace?',
        answer: `In order to connect your wallet, access the <a href="https://rcn.market/" target="_blank">RCN Credit Marketplace</a> and click on “Connect”. When the pop-up dialog appears, pick your wallet of choice from the available alternatives. Finally, follow the instructions on your wallet’s pop-up dialog to complete the process.

        If you don’t have an Ethereum wallet yet, please create one using <a href="https://medium.com/rcnblog/introducing-multi-wallet-login-fbdbb3bdb170" target="_blank">any of the available options</a>.`
      }, {
        question: 'How can I access the different sections and tools of the Credit Marketplace?',
        answer: `The RCN Credit Marketplace has several sections and tools which can be accessed using its navigation menu. These include the following:

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
      }, {
        question: 'How can I access previous versions of the protocol or the Credit Marketplace?',
        answer: 'If you want to interact with former iterations of the protocol or the Credit Marketplace and their loans or features, you can access them at the <a href="https://legacy.rcn.market/" target="_blank">Credit Marketplace Legacy Version</a>.'
      }]
    }, {
      title: 'Lending',
      faqs: [{
        question: 'Which are the different types of loans available on the Credit Marketplace?',
        answer: `The RCN Credit Marketplace allows creditors to access multiple lending alternatives, including both DeFi & CeFi loans. These are the main differences between them:

• DeFi (Decentralized Finance) P2P loans are requested by retail borrowers within the crypto ecosystem. They are denominated in cryptocurrencies and backed by crypto-collateral locked in a smart-contract. The funds obtained through them are usually employed to finance the borrowers’ leveraged investments.

• CeFi (Centralized Finance) loans are requested by Originators, economic entities that exist beyond the crypto ecosystem. They are denominated in either fiat or crypto currencies, and backed by their borrower’s reputation. The funds obtained through them are usually applied to satisfy the Originators’ general financial requirements.`
      }, {
        question: 'Which is the most important information I should consider before funding a loan?',
        answer: `There are several pieces of information that you should consider before deciding to fund a loan, all of which can be found on the loan’s Detailed View. These include the following:

• The Borrower’s Ethereum wallet address, accompanied by a description and a set of relevant facts about it.

• The Borrowing Currency, which is the currency in which the loan and its interests are denominated.

• The Annual Rate (short for Annual Percentage Rate or APR), which is the annualized interest rate paid by the borrower and earned by the lender for funding the loan (without taking compound interest into account).

• The Penalty Rate, which is the interest rate that replaces the Annual Rate in CeFi loans once the Due Date has passed and the loan’s status has changed to Overdue. This rate is applied to both the principal and the interest accrued until that moment.

• The Lend amount, which is the amount the lender has to deposit in order to fund the loan, denominated in the Borrowing Currency. This amount can also be seen expressed in the chosen Lending Currency on the Loan Lending dialog.

• The Receive amount, which is the amount of capital plus interest the lender will receive for funding the loan, denominated in the Borrowing Currency. A possible value for this amount can also be seen expressed in the chosen Lending Currency on the Loan Lending dialog.

• The Duration, which indicates the amount of time the borrower has in order to repay the loan. The consequences of a delayed repayment depend on the loan type: in CeFi loans, the loan’s status will change to Overdue and the Penalty Rate will replace the Annual Rate as the current interest rate; in DeFi loans, the loan’s collateral will get partially liquidated to repay the accrued debt, with the remaining collateral being available for withdrawal after the loan has been fully repaid.

• The Instalments Schedule, which indicates the number, date and amount of the payments in which the Receive amount will be repaid. Each of these payments implies another due date in the loan’s repayment schedule.

• The Oracle, represented by its Ethereum address, which supplies the exchange rate used to calculate the equivalence between amounts denominated in the Borrowing and Lending Currencies.

• The Collateral Status, which offers several indicators related to the loan’s collateral, including the following:

  ◦ Collateral Amount, the amount of funds currently collateralized.

  ◦ Collateral Ratio, the proportion between the value of the collateral and the value of the borrowed funds.

  ◦ Liquidation Ratio, the value of the Collateral Ratio at which the collateral will get partially or fully liquidated.

  ◦ Safety Ratio, the value the Collateral Ratio will reach after a collateral liquidation.

  ◦ Current Exchange Rate, between the Collateralization Currency and the Borrowing Currency.

  ◦ Liquidation Exchange Rate, the exchange rate at which the Collateral Ratio will reach the Liquidation Ratio.

Most of these variables are set by the borrower as part of the loan requesting process.
`
      }, {
        question: 'Which Lending Currencies can I use to fund a loan?',
        answer: 'Every loan on the RCN Credit Marketplace can be funded using one of many Lending Currencies, including RCN, USDC, DAI and ETH.'
      }, {
        question: 'In which Repayment Currency is the Receive amount paid in?',
        answer: 'All loans are repaid using USDC, which is the Credit Marketplace’s only Repayment Currency.'
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
        question: 'How can I fund a loan?',
        answer: 'In order to fund a loan verify that you have sufficient funds in any of the available Lending Currencies, go to the <a href="https://rcn.market/lend" target="_blank">Lend</a> section, choose the one you want to fund and click on it to access its Detailed View. Once you have verified its terms and made sure you understood them, click on the “Lend” button. When the pop-up dialog appears, choose the Lending Currency you want to fund the loan with and verify the Lend amount and the Receive amount in both the Lending Currency and the Borrowing Currency. Remember that while the Receive Amount expressed in the Borrowing Currency is not affected by exchange rate fluctuations, the Receive Amount expressed in the Lending Currency is, which means it can change. Finally, click on the “Lend” button, confirm the transaction on your wallet’s pop-up dialog and wait until the loading bar indicates that the process is complete. Once it is, you will be able to see your newly funded loan on the My Loans section, under the “Lent” tag.'
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
        question: 'What happens if a DeFi loan’s Collateral Ratio drops too much?',
        answer: `A DeFi loan’s Collateral Ratio will fall if the value of its collateral decreases in relation to the value of the loan. If the Collateral Ratio drops to 150%, the loan’s collateral will get automatically liquidated (either in part or in full) to repay a portion of the debt, reducing both the Collateral Amount and the Outstanding Amount and reincreasing the Collateral Ratio until it reaches 200%.`
      }, {
        question: 'What happens if a loan is not repaid on time?',
        answer: `The consequences of a loan not being repaid by the time one of its due dates arrives depend on whether it is a DeFI or a CeFi loan:

• If a DeFi loan is not repaid on time its collateral will get partially or totally liquidated to repay the accrued debt. In order to preserve the collateral’s role as the lender’s protection against default, a partial or total collateral liquidation and debt repayment will also take place if the Collateral Ratio reaches the Liquidation Ratio. While a DeFi loan’s status will never change to Overdue, if the repayment is total the status will change to Repaid and no further debt will be accrued.

• If a CeFi loan is not repaid on time, its status will change to Overdue and the Penalty Rate will replace the Annual Rate as the loans’ interest rate. This rate will be applied to both the principal and the interest accrued so far. When the loan’s accrued debt is repaid, the status will change back to Outstanding and the Annual Rate will be reinstated. If the repayment is total, the status will change to Repaid and no further debt will be accrued.`
      }, {
        question: 'How can I withdraw my repaid funds?',
        answer: 'Once your funded loan reaches the Repaid status, you will be able to verify and collect your capital plus interest by clicking on the Withdrawable Balance tool. After approving your wallet’s transaction, the accrued funds from all your Repaid loans will be transferred to your address.'
      }, {
        question: 'Can I fund loans using my previous unwithdrawn repaid funds?',
        answer: 'No, in order to fund a loan using your previously repaid funds you will first have to withdraw them from your Withdrawable Balance to your wallet.'
      }, {
        question: 'Where can I keep track of my funded loans?',
        answer: 'You can see all your funded loans and keep track of their current status, repayment schedule and Loan History (which includes information about all their previous status’ changes) by clicking on them on the My Loans section.'
      }]
    }, {
      title: 'Borrowing',
      faqs: [{
        question: 'Which are the different types of borrowers on the Credit Marketplace?',
        answer: `The RCN Credit Marketplace supports 2 different types of borrowers, each one allowed to request a specific type of loan. These are the main differences between them:

• Retail borrowers can request DeFi (Decentralized Finance) P2P loans. These are denominated in cryptocurrencies and backed by crypto-collateral locked by the borrower in a smart-contract.

• Originators (economic entities that exist beyond the crypto ecosystem) can request CeFi (Centralized Finance) loans. These are denominated in either fiat or crypto currencies, and backed by their borrower’s reputation.`
      }, {
        question: 'Which variables can I define or verify when requesting a loan?',
        answer: `There are several variables that borrowers can set or check while requesting a DeFi loan, all of which can be found on the <a href="https://rcn.market/borrow" target="_blank">Borrowing Portal</a>. These include the following:

• The Borrowing Currency, which is the currency in which the loan and its interests are denominated.

• The Borrow amount, which is the amount the borrower is requesting, denominated in the Borrowing Currency.

• The Repay amount, which is the amount of capital plus interest the borrower has to pay back to fully repay a loan, denominated in the Borrowing Currency.

• The Annual Rate (short for Annual Percentage Rate or APR), which is the annualized interest rate paid by the borrower and earned by the lender for funding the loan (without taking compound interest into account).

• The Duration, which indicates the amount of time the borrower has in order to repay the loan before its collateral gets partially or totally liquidated to repay the accrued debt.

• The Instalments, which allow to pay the Repay amount in several, evenly distributed and equal payments, instead of in one unique final payment. Each of these payments implies another due date in the loan’s repayment schedule.

• The Expiration Time, which indicates the amount of time the loan request will remain active before expiring, if it isn’t funded by a lender.

• The Oracle, which supplies the exchange rate used to calculate the equivalence between the different currencies involved in a loan. This variable can be verified but not defined by the borrower.

• The Collateral Amount, which is the amount of funds the borrower is locking to back the loan.

• The Collateral Ratio, which is the proportion between the value of the collateral and the value of the borrowed funds.

• The Liquidation Exchange Rate, which is the exchange rate at which the Collateral Ratio will reach the Liquidation Ratio.

• The Liquidation Ratio, which is the value of the Collateral Ratio at which the collateral will get partially or fully liquidated. This variable can be verified but not defined by the borrower.

• The Safety Ratio, which is the value the Collateral Ratio will reach after a collateral liquidation. This variable can be verified but not defined by the borrower.

• The Current Exchange Rate, which is between the Collateralization Currency and the Borrowing Currency. This variable can be verified but not defined by the borrower.`
      }, {
        question: 'Which Borrowing Currencies can I use to denominate a loan?',
        answer: 'DeFi loans can be denominated using one of many Borrowing Currencies, including RCN, USDC and ARS.'
      }, {
        question: 'Which Collateralization Currencies can I use to back a loan?',
        answer: 'DeFi loans can be backed using one of many Collateralization Currencies, including RCN and USDC.'
      }, {
        question: 'In which Receiving Currency is the Receive amount deposited in?',
        answer: 'All requested (and consequently lent) funds are received in USDC, which is the Credit Marketplace’s only Receiving Currency.'
      }, {
        question: 'In which Repayment Currency is the Repay amount paid in?',
        answer: 'All loans are repaid using USDC, which is the Credit Marketplace’s only Repayment Currency.'
      }, {
        question: 'How can I request a loan?',
        answer: `In order to request a loan, verify that you have sufficient funds in any of the available Collateralization Currencies, go to the <a href="https://rcn.market/borrow" target="_blank">Borrow</a> section and set your borrowing terms, including the Borrowing Currency, Amount, Duration, Annual Rate, Instalments and Expiration Time. When you are done check your selected terms (including the Repay amount), click on the “Create” button and approve your wallet’s transaction. Remember that your loan will not be available for lending until you supply your collateral, on the next step.

After closing your wallet’s transaction dialog, wait until the blue progress line disappears. Once it’s done you will find the required Collateralization Currency and Amount already displayed on the screen. The default Amount represents the quantity of collateral required to reach a 200% Collateral Ratio, which is the minimum allowed initial ratio between the value of your collateral and the value of your borrowed funds. While lower amounts won’t allow you to collateralize your loan, you can choose a higher amount to decrease your chances of facing a collateral liquidation (which will happen if your Collateral Ratio drops to 150%). Once you have set an amount click on the “Confirm” button, approve your wallet’s transaction and wait until the blue progress line disappears. Once it does, you will be able to see your newly requested loan on the My Loans section, under the “Borrowed” tag.

When a lender funds your loan its status will change from Requested to Outstanding, and you will receive your Borrow amount (converted to USDC) in your wallet.`
      }, {
        question: 'Why do I need to overcollateralize my loan?',
        answer: 'As most platforms with support for DeFi loans, the Credit Marketplace requires borrowers to deposit collateral to provide their lenders with a safeguard against potential defaults. Since most Collateralization Currencies are exposed to price variations (which can result in depreciations relative to the value of the Borrowing Currency), the Collateral Amount is always at risk of becoming less valuable than the Repay Amount, making itself unsuitable as the loan’s collateral. To prevent this, the Collateral Ratio must always be 150% or higher, with an initial value of at least 200%.'
      }, {
        question: 'Why do I have to approve two different transactions?',
        answer: 'Because creating a loan request and supplying collateral to it demands two different Ethereum transactions, both of which have to be completed in order for the loan to be available for lending.'
      }, {
        question: 'What do the different Loan status mean?',
        answer: `All loans display a status which varies through their life cycle and offers important information about them. These include the following:

• A Requested status, which indicates that the loan has been requested by a borrower but not yet funded. Requested Loans give information about their duration but not about specific repayment dates, since those cannot be established until the loan has been funded.

• An Ongoing status, which indicates that the loan has been funded but not yet repaid. Ongoing Loans show their due dates and the time remaining until they arrive.

• A Repaid status, which indicates that the loan has been fully repaid.`
      }, {
        question: 'What happens if my loan’s Collateral Ratio changes?',
        answer: `Your Collateral Ratio can change due to price fluctuations in your loan’s Borrowing Currency and Collateralization Currency, generating opposite consequences. If the value of your Collateralization Currency increases in relation to the value of your Borrowing Currency, your Collateral Ratio will grow. On the contrary, if the first one decreases, the second one will fall.

If your Collateral Ratio drops below 100%, it means that your collateral has become less valuable than your debt, making itself unsuitable as the loan’s collateral. To prevent this from happening, if the Collateral Ratio reaches 150% your collateral will get automatically liquidated to repay the debt, either partially or totally. This will reduce both your Collateral Amount and Outstanding Amount, returning your Collateral Ratio to 200%.`
      }, {
        question: 'How can I adjust my loan’s Collateral Amount?',
        answer: `In order to adjust your loan’s Collateral Amount, access its detailed view by clicking on it on the My Loans section, under the “Borrowed” tag. Once you are there, click on the “Deposit” or “Withdraw” buttons on the Adjust Collateral section. When the dialog appears, select the amount you want to deposit or withdraw and check the Adjusted Amount and Adjusted Collateral Ratio. Bear in mind that if you are withdrawing collateral the Adjusted Collateral Ratio can never be lower than 200% (you can easily set the amount to the Maximum Withdrawal by clicking on the “Max” button). Once you have set an amount click on the “Deposit” or “Withdraw” button, approve your wallet’s transaction and wait until the blue progress line disappears.
Once it does, you will see the updated Collateral Amount and Collateral Ratio when you access your loan on the My Loans section. You can repeat the Collateral Adjusting process as many times as you want.`
      }, {
        question: 'How can I repay my loan?',
        answer: 'In order to repay your loan, verify that you have sufficient funds in USDC and access its detailed view by clicking on it on the My Loans section, under the “Borrowed” tag. Once you are there, click on the “Repay” button, set the amount you’d like to repay in the Borrowing Currency and verify its equivalent in USDC. You can make sure to repay your debt in full by clicking on the “Repay Total” button. If you choose to pay less, make sure to pay the rest of your Outstanding Amount before the Due Date arrives. Once you have set an amount click on the “Repay” button, approve your wallet’s transaction and wait until the blue progress line disappears. After your final payment is complete your loan’s status will change from Outstanding to Repaid, and you will be able to withdraw your remaining collateral.'
      }, {
        question: 'Can I repay my loan before its due date?',
        answer: 'Yes, but while an earlier repayment will allow you to withdraw your collateral in advance, it will not reduce the amount of interest you will have to repay.'
      }, {
        question: 'What happens if I don’t repay my loan on time?',
        answer: 'Whether it is your loan’s final payment or any of the partial payments related to its instalments, all repayments must be completed before their corresponding Due Date arrives. Failing to do so will cause your collateral to get automatically liquidated (either in part or in full) to settle the corresponding payment.'
      }, {
        question: 'How can I withdraw my collateral once my loan has been repaid?',
        answer: 'In order to withdraw your remaining collateral once your loan has been fully repaid, access its detailed view by clicking on it on the My Loans section, under the “Borrowed” tag. Once you are there, click on the “Withdraw” button and approve your wallet’s transaction to receive the funds in your wallet. After it, you will still be able to see your Loan on the My Loans section under the “Borrowed” tag, including its full event History and other relevant information.'
      }, {
        question: 'Where can I keep track of my requested loans?',
        answer: 'You can see all your requested loans and keep track of their current status, repayment schedule and Loan History (which includes information about all their previous status’ changes) by clicking on them on the My Loans section.'
      }]
    }, {
      title: '',
      faqs: [{
        question: 'Can’t find the answer to your question?',
        answer: 'You can always get support reaching out to the community on Telegram or contacting the Credit Marketplace’s development team via mail at helpdesk@rcn.finance.'
      }]
    }];
  }

  getId(groupIndex: number, faqIndex: number) {
    return `${groupIndex}${faqIndex}`;
  }
}
