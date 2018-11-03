export class Commit {
  opcode: string;
  timestamp: number;
  order: number;
  proof: string;
  data: object;

  styleProperties: {
    status: string,
    inserted: Boolean
  };

  constructor(opcode: string, timestamp: number, order: number, proof: string, data: object) {
    this.opcode = opcode;
    this.timestamp = timestamp;
    this.order = order;
    this.proof = proof;
    this.data = data;
  }
}

export class LentCommit extends Commit {
  styleProperties = {
    status: 'active',
    materialClass: 'material-icons',
    icon: 'trending_up',
    title: 'Lent',
    color: 'blue',
    message: 'Lent',
    inserted: false
  };

  data: {
    lender: string,
    loan: 1
  };
}

export class PartialPaymentCommit extends Commit {
  styleProperties = {
    status: 'active',
    awesomeClass: 'fas fa-coins',
    title: 'Partial Payment',
    color: 'green',
    message: 'Pay',
    inserted: true
  };

  data: {
    sender: string,
    amount: string,
    from: string,
    loan: number
  };
}

export class TransferCommit extends Commit {
  styleProperties = {
    status: 'active',
    materialClass: 'material-icons',
    icon: 'swap_horiz',
    title: 'Transfer',
    color: 'orange',
    message: 'Transfer',
    inserted: true
  };
  data: {
    loan: number,
    from: string,
    to: string
  };
}

export class DestroyedCommit extends Commit {
  styleProperties = {
    status: 'disabled',
    materialClass: 'material-icons',
    icon: 'delete',
    title: 'Destroyed',
    color: 'red',
    hexa: '#333',
    message: 'Destroyed',
    inserted: false
  };

  data: {
    loan: number,
    destroyed_by: string
  };
}
