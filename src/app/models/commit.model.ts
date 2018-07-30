export class Commit {
  opcode: string;
  timestamp: number;
  order: number;
  proof: string;
  data: object;
  style_properties: {
      status: string,
      inserted: Boolean
  }

  constructor(opcode: string, timestamp: number, order: number, proof: string, data: object) {
      this.opcode = opcode;
      this.timestamp = timestamp;
      this.order = order;
      this.proof = proof;
      this.data = data;
  }

  set_active(active: Boolean): void {
      status = active ? "active" : "disabled";
      this.style_properties.status = status;
  };

  is_active(): Boolean {
      return this.style_properties.status == "active";
  };

  set_inserted(inserted: Boolean): void {
      this.style_properties.inserted = inserted;
  };

  get_inserted(): Boolean {
      return this.style_properties.inserted;
  }

  export_to_object(): object {
      return this.style_properties;
  }

};

export class Lent{
  status: string;
  materialClass: string;
  icon: string;
  title: string;
  color: string;
  messege: string;
  inserted: boolean;

  constructor(status: string, materialClass: string, icon: string, title: string, color: string, messege: string){
    this.status = status;
    this.materialClass = materialClass;
    this.icon = icon;
    this.title = title;
    this.color = color;
    this.messege = messege;
    this.inserted = true;
  }
}

class TransferCommit extends Commit {
  style_properties: {
      status: "active",
      materialClass: "material-icons",
      icon: "swap_horiz",
      title: "Transfer",
      color: "orange"
      message: "Transfer",
      inserted: true
  }
  data: {
      loan: number,
      from: string,
      to: string
  };


}
class DestroyedCommit extends Commit {
  style_properties: {
      status: "disabled",
      materialClass: "material-icons",
      icon: "delete",
      title: "Destroyed",
      color: "red"
      hexa: "#333",
      message: "Destroyed",
      inserted: false
  }

  data: {
      loan: number,
      destroyed_by: string
  }
}

class LentCommit extends Commit {
  style_properties: {
      status: "active",
      materialClass: "material-icons",
      icon: "trending_up",
      title: "Lent",
      color: "blue",
      message: "Lent",
      inserted: false
  }

  data: {
      lender: string,
      loan: 1
  }
}

class LoanRequestCommit extends Commit {
  style_properties: {
      status: "active",
      materialClass: "material-icons",
      icon: "trending_up",
      title: "Request Loan",
      color: "blue",
      message: "Lent",
      inserted: false
  }

  data: {
      cancelable_at: string,
      created: string,
      amount: string,
      creator: string,
      currency: string,
      interest_rate: string,
      interest_rate_punitory: string,
      borrower: string,
      oracle: string,
      index: number,
      expiration_requests: string,
      dues_in: string
  }
}

class PartialPaymentCommit extends Commit {
  style_properties: {
      status: "active",
      awesomeClass: "fas fa-coins",
      title: "Partial Payment",
      color: "green",
      message: "Pay",
      inserted: true
  }

  data: {
      sender: string,
      amount: string,
      from: string,
      loan: number
  }
}

class ApprovedLoanCommit extends Commit {
  style_properties: {
      status: "active",
      awesomeClass: "fas fa-coins",
      title: "Approved Loan",
      color: "green",
      message: "Pay",
      inserted: true
  }

  data: {
      approved_by: string,
      loan: number
  }
}

class TotalPaymentCommit extends Commit {
  style_properties: {
      status: "active",
      awesomeClass: "fas fa-coins",
      title: "Total Payment",
      color: "green",
      message: "Pay",
      inserted: true
  }

  data: {
      loan: number
  }
}

class LoanExpiredCommit extends Commit {
  style_properties: {
      status: "active",
      awesomeClass: "fas fa-coins",
      title: "Loan ",
      color: "green",
      message: "Pay",
      inserted: true
  }

  data: {
      loan: number
  }
}

class Loan {
  index: number;
  created: number;
  status: number;
  oracle: string;
  borrower: string;
  lender: string;
  creator: string;
  cosigner: string;
  amount: string;
  interest: string;
  punitory_interest: string;
  interest_timestamp: string;
  paid: string;
  interest_rate: string;
  interest_rate_punitory: string;
  due_time: string;
  dues_in: string;
  currency: string;
  cancelable_at: string;
  lender_balance: string;
  expiration_requests: string;
  approved_transfer: string;
  commits: Array<Commit>;

  constructor(
      index: number,
      created: number,
      status: number,
      oracle: string,
      borrower: string,
      lender: string,
      creator: string,
      cosigner: string,
      amount: string,
      interest: string,
      punitory_interest: string,
      interest_timestamp: string,
      paid: string,
      interest_rate: string,
      interest_rate_punitory: string,
      due_time: string,
      dues_in: string,
      currency: string,
      cancelable_at: string,
      lender_balance: string,
      expiration_requests: string,
      approved_transfer: string,
      commits: Array<Commit>
  ) {
      this.index = index;
      this.created = created;
      this.status = status;
      this.oracle = oracle;
      this.borrower = borrower;
      this.lender = lender;
      this.creator = creator;
      this.cosigner = cosigner;
      this.amount = amount;
      this.interest = interest;
      this.punitory_interest = punitory_interest;
      this.interest_timestamp = interest_timestamp;
      this.paid = paid;
      this.interest_rate = interest_rate;
      this.interest_rate_punitory = interest_rate_punitory;
      this.due_time = due_time;
      this.dues_in = dues_in;
      this.currency = currency;
      this.cancelable_at = cancelable_at;
      this.lender_balance = lender_balance;
      this.expiration_requests = expiration_requests;
      this.approved_transfer = approved_transfer;
      this.commits = commits;
  };

  add_commit(commit: Commit): void {
      this.commits.push(commit);
  };

  disable_last_commit(): void {
      let last_index = this.commits.length - 1;
      let last_commit = this.commits[last_index];
      last_commit.set_inserted(false);
  };
};

let loan_1 = {
  "index": 1,
  "created": 1525462875,
  "status": 3,
  "oracle": "0x0000000000000000000000000000000000000000",
  "borrower": "0x35d803F11E900fb6300946b525f0d08D1Ffd4bed",
  "lender": "0x0000000000000000000000000000000000000000",
  "creator": "0x35d803F11E900fb6300946b525f0d08D1Ffd4bed",
  "cosigner": "0x0000000000000000000000000000000000000000",
  "amount": "200000000000000000000",
  "interest": "0",
  "punitory_interest": "0",
  "interest_timestamp": "0",
  "paid": "0",
  "interest_rate": "13523478260869",
  "interest_rate_punitory": "12441600000000",
  "due_time": "0",
  "dues_in": "1036800",
  "currency": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "cancelable_at": "172800",
  "lender_balance": "0",
  "expiration_requests": "1528227658",
  "approved_transfer": "0x0000000000000000000000000000000000000000",
  "commits": [
      {
          "opcode": "loan_request",
          "timestamp": 1525462875,
          "order": 0,
          "proof": "0xc45347905acb3d17f958b02454e2e6ea355d3bb4ad4a39e12d44544df429ab9d",
          "data": {
              "index": 1,
              "interest_rate": "13523478260869",
              "created": "1525462875",
              "oracle": "0x0000000000000000000000000000000000000000",
              "expiration_requests": "1528227658",
              "cancelable_at": "172800",
              "dues_in": "1036800",
              "currency": "0x0000000000000000000000000000000000000000000000000000000000000000",
              "amount": "200000000000000000000",
              "interest_rate_punitory": "12441600000000",
              "creator": "0x35d803F11E900fb6300946b525f0d08D1Ffd4bed",
              "borrower": "0x35d803F11E900fb6300946b525f0d08D1Ffd4bed"
          }
      },
      {
          "opcode": "approved_loan",
          "timestamp": 1525462875,
          "order": 1,
          "proof": "0xc45347905acb3d17f958b02454e2e6ea355d3bb4ad4a39e12d44544df429ab9d",
          "data": {
              "loan": 1,
              "approved_by": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed"
          }
      },
      {
          "opcode": "transfer",
          "timestamp": 1525898579,
          "order": 16,
          "proof": "0x809e74f9f3fbf390b064db73765d3533c87a02592cbdd1afb3d3c703657eee40",
          "data": {
              "loan": 1,
              "to": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed",
              "from": "0x0000000000000000000000000000000000000000"
          }
      },
      {
          "opcode": "lent",
          "timestamp": 1525898579,
          "order": 17,
          "proof": "0x809e74f9f3fbf390b064db73765d3533c87a02592cbdd1afb3d3c703657eee40",
          "data": {
              "lender": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed",
              "loan": 1
          }
      },
      {
          "opcode": "partial_payment",
          "timestamp": 1527592748,
          "order": 163,
          "proof": "0x0f18247aa0b8b413ffbcd59b5505d19431f14eb90debb34d6fdecc427890ec74",
          "data": {
              "loan": 1,
              "sender": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed",
              "from": "0x0000000000000000000000000000000000000000",
              "amount": "122000000000000000000"
          }
      },
      {
          "opcode": "transfer",
          "timestamp": 1528415100,
          "order": 308,
          "proof": "0xe3c18578734726113a6eac6d40a558904ec9a1d9d5804e58c80ea0efcc3b5f37",
          "data": {
              "loan": 1,
              "to": "0xa09231e9df3372f3cd9862d80e0669f4bf33150c",
              "from": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed"
          }
      },
      {
          "opcode": "partial_payment",
          "timestamp": 1531489185,
          "order": 418,
          "proof": "0x4ca3c86e1a09c877efd0857f38a2772eedf168e050b35037fe11183f447a49c1",
          "data": {
              "loan": 1,
              "sender": "0x59ccfc50bd19dcd4f40a25459f2075084eebc11e",
              "from": "0x35d803f11e900fb6300946b525f0d08d1ffd4bed",
              "amount": "83131956997824523889"
          }
      },
      {
          "opcode": "total_payment",
          "timestamp": 1531489185,
          "order": 419,
          "proof": "0x4ca3c86e1a09c877efd0857f38a2772eedf168e050b35037fe11183f447a49c1",
          "data": {
              "loan": 1
          }
      },
      {
          "opcode": "transfer",
          "timestamp": 1531489185,
          "order": 420,
          "proof": "0x4ca3c86e1a09c877efd0857f38a2772eedf168e050b35037fe11183f447a49c1",
          "data": {
              "loan": 1,
              "to": "0x0000000000000000000000000000000000000000",
              "from": "0xa09231e9df3372f3cd9862d80e0669f4bf33150c"
          }
      }
  ],
  "approbations": [
      "0x35d803f11e900fb6300946b525f0d08d1ffd4bed"
  ]
}
// let commit_object = loan_1.commits[0];
// let commit = new TransferCommit(commit_object.opcode, commit_object.timestamp, commit_object.order, commit_object.proof, commit_object.data);

function build_timeline(loan: Loan): Array<Commit> {
  let timeline: Array<Commit> = [];
  // console.log(timeline);
  for (let commit of loan.commits) {
      // console.log(commit.opcode);
      // array = commit.export_to_object();
      switch (commit.opcode) {
          case "approved_loan": {
              let c = new ApprovedLoanCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "loan_request": {
              let c = new LoanRequestCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "destroyed_loan": {
              let c = new DestroyedCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "approved_loan": {
              let c = new ApprovedLoanCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "lent": {
              let c = new LentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "partial_payment": {
              let c = new PartialPaymentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "total_payment": {
              let c = new TotalPaymentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
          case "transfer": {
              let c = new TransferCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              timeline.push(c);
              break;
          }
      }
  };
  return timeline;

}

function parse_response(json: any): Loan {
  let commits: Array<Commit> = [];
  let loan: Loan;
  for (let commit of json.commits) {
      // console.log(commit.opcode);
      switch (commit.opcode) {
          case "approved_loan": {
              let c = new ApprovedLoanCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "loan_request": {
              let c = new LoanRequestCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "destroyed_loan": {
              let c = new DestroyedCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "approved_loan": {
              let c = new ApprovedLoanCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "lent": {
              let c = new LentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "partial_payment": {
              let c = new PartialPaymentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "total_payment": {
              let c = new TotalPaymentCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
          case "transfer": {
              let c = new TransferCommit(commit.opcode, commit.timestamp, commit.order, commit.proof, commit.data);
              commits.push(c);
              break;
          }
      }
  };
  loan = new Loan(
      json.index,
      json.created,
      json.status,
      json.oracle,
      json.borrower,
      json.lender,
      json.creator,
      json.cosigner,
      json.amount,
      json.interest,
      json.punitory_interest,
      json.interest_timestamp,
      json.paid,
      json.interest_rate,
      json.interest_rate_punitory,
      json.due_time,
      json.dues_in,
      json.currency,
      json.cancelable_at,
      json.lender_balance,
      json.expiration_requests,
      json.approved_transfer,
      commits);
  return loan
}

function parse_loans(json: any): Loan[] {
  let loans: Loan[] = [];
  for (loan of json.content) {
      loans.push(parse_response(loan));
  }

  return loans;
}


let loan = parse_response(loan_1);
// console.log(loan);
let timeline = build_timeline(loan);
// console.log(timeline);


// #1 get response endpoint
// #2 parsear json (parse_response | parse_loans)
// #3 armar timeline parse x --> build_timeline(loan)