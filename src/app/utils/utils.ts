
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
    static formatDelta(totalSeconds: number, display: number = 5): string {
        let prefix = '';

        if (totalSeconds < 0) {
            prefix = '- ';
            totalSeconds *= -1;
        }

        totalSeconds = Math.abs(totalSeconds);
        const secondsInYear = 86400 * 365;
        const years = Math.floor(totalSeconds / secondsInYear);
        totalSeconds %= secondsInYear;
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let result = '';
        let visible = 0;

        if (years !== 0 && visible < display) {
            result += years + ' years, ';
            visible++;
        }

        if (days !== 0 && visible < display) {
            result += days + ' days, ';
            visible++;
        }

        if (hours !== 0 && visible < display) {
            result += hours + ' hours, ';
            visible++;
        }

        if (minutes !== 0 && visible < display) {
            result += minutes + ' minutes, ';
            visible++;
        }

        return prefix + result.slice(0, -2);
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

export function promisify(inner) {
    return new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );
}
