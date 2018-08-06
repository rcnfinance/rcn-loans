export class Utils {
    static address_0 = '0x0000000000000000000000000000000000000000';

    static formatInterest(raw: number): number {
        return 311040000000000 / raw;
    }

    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : ( r & 0x3 | 0x8 );
            return v.toString(16);
        });
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

    static shortAddress(address: string): string {
        return address.substr(0, 4) + '...' + address.substr(-4);
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
    }

    static formatAmount(amount: Number): string {
        const maxDigits = 6;
        if (amount.toString().length <= maxDigits) {
            return amount.toString();
        } else {
            const intDigits = amount.toFixed(0).toString().length;
            const decDigits = maxDigits - intDigits;

            let decimals = (decDigits > 0) ? decDigits : 0;

            return Number(amount.toFixed(decimals)).toString();
        }
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
