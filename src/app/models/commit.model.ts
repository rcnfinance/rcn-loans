export class Commit {
  opcode: string;
  timestamp: number;
  order: number;
  proof: string;
  data: object;

  style_properties: {
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

  set_active(active: Boolean): void {
    status = active ? 'active' : 'disabled';
    this.style_properties.status = status;
  }

  is_active(): Boolean {
    return this.style_properties.status === 'active';
  }

  set_inserted(inserted: Boolean): void {
    this.style_properties.inserted = inserted;
  }

  get_inserted(): Boolean {
    return this.style_properties.inserted;
  }

  export_to_object(): object {
    return this.style_properties;
  }
}

export class LentCommit extends Commit {
  style_properties = {
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
  style_properties = {
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
  style_properties = {
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
  style_properties = {
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
