import { FormatAddressPipe } from './format-address.pipe';

describe('FormatAddressPipe', () => {

  const INVALID_ADDRESS_RESULT = '-';

  it('create an instance', () => {
    const pipe = new FormatAddressPipe();
    expect(pipe).toBeTruthy();
  });

  it('should be format an address', () => {
    const address = '0x6b800281ca137fE073c662e34440420E91F43DeB';
    expect(new FormatAddressPipe().transform(address)).toEqual('0x6b...3DeB');
  });

  it('should be return an invalid address', () => {
    expect(new FormatAddressPipe().transform('')).toEqual(INVALID_ADDRESS_RESULT);
    expect(new FormatAddressPipe().transform(null)).toEqual(INVALID_ADDRESS_RESULT);
    expect(new FormatAddressPipe().transform(1 as any)).toEqual(INVALID_ADDRESS_RESULT);
    expect(new FormatAddressPipe().transform(false as any)).toEqual(INVALID_ADDRESS_RESULT);
  });
});
