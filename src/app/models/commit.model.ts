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