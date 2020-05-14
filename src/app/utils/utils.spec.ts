import * as BN from 'bn.js';
import { Utils } from './utils';

describe('Utils', () => {
  it('should return a bn', () => {
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(1234)).toEqual(new BN(1234));
    expect(Utils.bn(new BN(1234))).toEqual(new BN(1234));
  });

  it('should return a string without scientific notation', () => {
    expect(Utils.scientificToDecimal(1e32)).toEqual(Utils.bn(10).pow(Utils.bn(32)).toString());
    expect(Utils.scientificToDecimal(1e64)).toEqual(Utils.bn(10).pow(Utils.bn(64)).toString());
    expect(Utils.scientificToDecimal(1e+12)).toEqual(Utils.bn(10).pow(Utils.bn(12)).toString());
    expect(Utils.scientificToDecimal(-1e+12)).toEqual(Utils.bn(10).pow(Utils.bn(12)).neg().toString());
    expect(Utils.scientificToDecimal(100)).toEqual('100');
    expect(Utils.scientificToDecimal(-100)).toEqual('-100');
  });
});
