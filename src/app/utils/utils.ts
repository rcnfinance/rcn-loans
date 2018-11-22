export class Utils {
  static address0x = '0x0000000000000000000000000000000000000000';

  static formatInterest(raw: number): number {
    return 311040000000000 / raw;
  }

  static hexToAscii(str) {
    const hexString = str;
    let strOut = '';
    for (let x = 0; x < hexString.length; x += 2) {
      strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
    }
    return strOut;
  }

  static formatAddress(hex: string): string {
    return hex.replace('0x000000000000000000000000', '0x');
  }

  static toBytes32(hex: string): string {
    const raw = hex.replace('0x', '');
    const result = hex.replace('0x', '0x' + '0'.repeat(64 - raw.length));
    return result;
  }

  static toBytes(hex: string): string {
    return '0x' + '0'.repeat(64 - hex.length) + hex;
  }

  static initBytes(): string {
    return '0x' + '0'.repeat(64);
  }

  static isEmpty(hex: string) {
    return hex === '0x';
  }

  static shortAddress(address: string): string {
    return address.substr(0, 4) + '...' + address.substr(-4);
  }

  static formatDelta(totalSeconds: number, display: number = 2): string {
    let result = '';
    let visible = 0;

    function timeToStr(x, str) {
      if (x !== 0 && visible < display) {
        result += x + str;
        visible++;
      }
    }

    let prefix = '';

    if (totalSeconds < 0) {
      prefix = '- ';
      totalSeconds *= -1;
    }

    totalSeconds = Math.abs(totalSeconds);
    const secondsInYear = 86400 * 365;
    const years = Math.floor(totalSeconds / secondsInYear);
    timeToStr(years, ' years, ');
    totalSeconds %= secondsInYear;
    const days = Math.floor(totalSeconds / 86400);
    timeToStr(days, ' days, ');
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    timeToStr(hours, ' hours, ');
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    timeToStr(minutes, ' minutes, ');
    const seconds = totalSeconds % 60;
    timeToStr(seconds, ' seconds, ');

    return prefix + result.slice(0, -2);
  }

  static formatAmount(amount: Number, maxDigits = 6): string {
    if (amount.toString().length <= maxDigits) {
      return amount.toString();
    }

    const intDigits = amount.toFixed(0).toString().length;
    const decDigits = maxDigits - intDigits;

    const decimals = (decDigits > 0) ? decDigits : 0;

    return Number(amount.toFixed(decimals)).toString();
  }

  static removeTrailingZeros(value: string): string {
    value = value.toString();

    if (value.indexOf('.') === -1) {
      return value;
    }

    while ((value.slice(-1) === '0' || value.slice(-1) === '.') && value.indexOf('.') !== -1) {
      value = value.substr(0, value.length - 1);
    }

    return value;
  }
}

export function promisify(func: any, args: any): Promise<any> {
  return new Promise((res, rej) => {
    func(...args, (err: any, data: any) => {
      if (err) { return rej(err); }
      return res(data);
    });
  });
}
