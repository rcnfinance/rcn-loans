
export class Loan {
    public id: number;
    public status: number;
    public borrower: string;
    public creator: string;
    public rawAmount: number;
    public duration: number;
    public rawAnnualInterest: number;
    public rawAnnualPunitoryInterest: number;
    public currencyRaw: string;

    constructor(
      id: number,
      status: number,
      borrower: string,
      creator: string,
      rawAmount: number,
      duration: number,
      rawAnnualInterest: number,
      rawAnnualPunitoryInterest: number,
      currencyRaw: string) {
        this.id = id;
        this.status = status;
        this.borrower = this.formatAddress(borrower);
        this.creator = this.formatAddress(creator);
        this.rawAmount = rawAmount;
        this.duration = duration;
        this.rawAnnualInterest = rawAnnualInterest;
        this.rawAnnualPunitoryInterest = rawAnnualPunitoryInterest;
        this.currencyRaw = currencyRaw;
      }

    get currency(): string {
        const targetCurrency = this.hexToAscii(this.currencyRaw.replace(/^[0x]+|[0]+$/g,''));

        if (targetCurrency == "") {
            return 'RCN';
        } else {
            return targetCurrency;
        }
    }

    formatInterest(raw: number): number {
        return 311040000000000 / raw;
    }

    hexToAscii(str){
        let hexString = str;
        let strOut = '';
            for (let x = 0; x < hexString.length; x += 2) {
                strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
            }
        return strOut;    
    }
    formatAddress(hex: string): string {
        return hex.replace('0x000000000000000000000000', '0x');
    }
    formatDelta(totalSeconds: number): string{
        const secondsInYear = 86400 * 365;
        let years = Math.floor(totalSeconds / secondsInYear);
        totalSeconds %= secondsInYear;
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
      
        let result = '';
        
        if (years != 0) {
            result += years + ' years, ';
        }

        if (days != 0) {
          result += days + ' days, '
        }
      
        if (hours != 0) {
          result += hours + ' hours, '
        }
      
        if (minutes != 0) {
          result += minutes + ' minutes, '
        }
        return result.slice(0, -2)
    }

    get borrowerShort(): string {
        return this.borrower.substr(0, 4) + '...' + this.borrower.substr(-4);
    }

    get decimals(): number {
        // TODO: Detect fiat currency
        return 18;
    } 

    get amount(): number {
        return this.rawAmount / 10 ** this.decimals;
    }

    get annualInterest(): number {
        return this.formatInterest(this.rawAnnualInterest);
    }

    get annualPunitoryInterest(): number {
        return this.formatInterest(this.rawAnnualPunitoryInterest);
    }

    get verboseDuration(): string {
        return this.formatDelta(this.duration);
    }

    get expectedReturn(): number {
        return ((this.amount * 100000 * this.duration) / this.rawAnnualInterest) + this.amount;
    }
  }
