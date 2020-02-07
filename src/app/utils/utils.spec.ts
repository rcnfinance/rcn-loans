import * as BN from 'bn.js';
import { Utils } from './utils';

describe('Utils', () => {
  it('should return a bn', () => {
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(new BN(1234))).toEqual(new BN(1234));
  });
});
