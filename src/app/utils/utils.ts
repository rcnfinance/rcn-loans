import * as BN from 'bn.js';

export class Utils {
  static address0x = '0x0000000000000000000000000000000000000000';
  static emptyString = '';

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

  static toBytes32(hex: string, inverse?: boolean): string {
    const raw = hex.replace('0x', '');
    if (inverse) {
      return hex.concat('0'.repeat(64 - raw.length));
    }
    return hex.replace('0x', '0x' + '0'.repeat(64 - raw.length));
  }

  static toBytes(hex: string): string {
    return '0x' + '0'.repeat(64 - hex.length) + hex;
  }

  static initBytes(): string {
    return Utils.toBytes(Utils.emptyString);
  }

  static isEmpty(hex: string) {
    return hex === '0x';
  }

  static shortAddress(address: string): string {
    try {
      return address.substr(0, 4) + '...' + address.substr(-4);
    } catch {
      return address;
    }
  }

  static capFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static formatDelta(totalSeconds: number, display: number = 2, showSeconds = false): string {
    let result = '';
    let visible = 0;

    function timeToStr(x, str) {
      if (x !== 0 && visible < display) {
        result += x + str;
        visible++;
      }
    }

    const prefix = '';

    if (totalSeconds < 0) {
      totalSeconds *= -1;
    }

    totalSeconds = Math.abs(totalSeconds);
    const secondsInYear = 86400 * 365;
    const years = Math.floor(totalSeconds / secondsInYear);
    timeToStr(years, ' Years, ');
    totalSeconds %= secondsInYear;
    const days = Math.floor(totalSeconds / 86400);
    timeToStr(days, ' Days, ');
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    timeToStr(hours, ' Hours, ');
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    timeToStr(minutes, ' Minutes, ');

    if (showSeconds) {
      const seconds = totalSeconds % 60;
      timeToStr(seconds.toFixed(0), ' Seconds, ');
    }

    return prefix + result.slice(0, -2);
  }

  /**
   * Format amounts to show
   * @param amount Amount to format
   * @param decimals Decimals to show
   * @param withCommas Show x,xxx.xx
   * @return Formatted amount
   */
  static formatAmount(
    amount: number | string | BN,
    decimals = 2,
    withCommas = true
  ): string {
    const parse = (rawAmount: number | string | BN, minimumFractionDigits = decimals) => {
      if (typeof rawAmount !== 'number') {
        rawAmount = Number(rawAmount);
      }
      if (!rawAmount) {
        rawAmount = 0;
      }
      const fixedAmount: any = (rawAmount as Number).toFixed(minimumFractionDigits);
      const fixedAmountWithoutRounding =
        fixedAmount <= rawAmount ? fixedAmount : (fixedAmount - Math.pow(0.1, minimumFractionDigits)).toFixed(minimumFractionDigits);
      return !withCommas ?
        fixedAmountWithoutRounding :
        Number(fixedAmountWithoutRounding).toLocaleString('en-US', { minimumFractionDigits });
    };

    if (!withCommas) {
      return parse(amount);
    }

    // if amount >= 0, return it
    const formattedValue = parse(amount);
    if (Number(formattedValue) as any !== 0) {
      return formattedValue;
    }

    // else, try adding more decimals (with an established limit)
    const decimalsLimit = 8;
    if (decimals >= decimalsLimit) {
      return formattedValue;
    }

    // recursively search for an amount that is allowed
    let updatedFormattedValue: string;
    for (let i = decimals; i <= decimalsLimit; i++) {
      const newFormattedValue = parse(amount, i);
      if (!updatedFormattedValue && Number(newFormattedValue) as any !== 0) {
        updatedFormattedValue = newFormattedValue;
      }
    }

    return updatedFormattedValue || formattedValue;
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

  /**
   * Return the interest rate based on an annual percentage
   * @param interest Annual percentage
   * @return Interest rate
   */
  static toInterestRate(interest: number) {
    const secondsInYear = 360 * 86400;
    const rawInterest = Math.floor(10000000 / interest);
    return rawInterest * secondsInYear;
  }

  /**
   * Calculates the payment for a loan based on constant payments and a constant interest rate.
   * @param rate The interest rate
   * @param nperiod The number of payments to be made
   * @param pv The current value of the annuity
   * @param fv The future value remaining after the final payment has been made
   * @param type Whether payments are due at the end (0) or beginning (1) of each period
   * @return Payment amount with interest
   */
  static pmt(
    rate: number,
    nperiod: number,
    pv: number,
    fv: number = 0,
    type: number = 0
  ): BN {
    const parsedPmt = (amount: number) => {
      try {
        const strAmount: string =
          Math.round(amount).toLocaleString('en-US', { useGrouping: false });
        return Utils.bn(strAmount);
      } catch (err) {
        return Utils.bn(amount);
      }
    };

    if (!fv) {
      fv = 0;
    }
    if (!type) {
      type = 0;
    }
    if (rate === 0) {
      const amountToReturn = -(pv + fv) / nperiod;
      return parsedPmt(amountToReturn);
    }

    const pvif = Math.pow(1 + rate, nperiod);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fv);

    if (type === 1) {
      pmt /= (1 + rate);
    }

    return parsedPmt(pmt);
  }

  /**
   * Return an amount in wei
   * @param amount Form raw amount
   * @param decimals Token decimals
   * @return amount.pow(decimals)
   */
  static getAmountInWei(amount: number, decimals: number): BN {
    if (amount % 1 !== 0) {
      const amountInWei: number = amount * (10 ** decimals);
      try {
        return this.bn(amountInWei.toLocaleString('en-US', { useGrouping: false }));
      } catch (err) {
        return this.bn(amountInWei);
      }
    }
    return this.bn(amount).mul(this.pow(10, decimals));
  }

  /**
   * Convert the specified value to BN
   * @param value Value
   * @param base Base
   * @return Value as BN
   */
  static bn(value: number | string | BN = 0, base?: number | 'hex'): BN {
    // remove scientific notation
    if (typeof value === 'number') {
      value = String(this.scientificToDecimal(value));
    }
    // remove decimals
    if (String(value).includes('.')) {
      value = String(value).split('.')[0];
    }
    return new BN(value, base);
  }

  static scientificToDecimal(num) {
    const SCIENTIFIC_NUMBER_REGEX = /\d+\.?\d*e[\+\-]*\d+/i;
    num = String(num);
    const numberHasSign = num.startsWith('-') || num.startsWith('+');
    const sign = numberHasSign ? num[0] : '';
    num = numberHasSign ? num.replace(sign, '') : num;

    // if the number is in scientific notation remove it
    if (SCIENTIFIC_NUMBER_REGEX.test(num)) {
      const zero = '0';
      const parts = String(num).toLowerCase().split('e'); // split into coeff and exponent
      const e: any = parts.pop(); // store the exponential part
      let l = Math.abs(e); // get the number of zeros
      const regSign = e / l;
      const coeffArray: any = parts[0].split('.');

      if (regSign === -1) {
        coeffArray[0] = Math.abs(coeffArray[0]);
        num = zero + '.' + new Array(l).join(zero) + coeffArray.join('');
      } else {
        const dec = coeffArray[1];
        if (dec) l = l - dec.length;
        num = coeffArray.join('') + new Array(l + 1).join(zero);
      }
    }

    return `${ sign }${ num }`;
  }

  /**
   * Math pow function with BN
   * @param base
   * @param exponent
   * @return base.pow(exponent)
   */
  static pow(base: number | string | BN, exponent: number | string | BN) {
    return this.bn(base).pow(this.bn(exponent));
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
