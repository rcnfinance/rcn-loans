
export class Utils {
    static formatInterest(raw: number): number {
        return 311040000000000 / raw;
    }

    static hexToAscii(str){
        let hexString = str;
        let strOut = '';
            for (let x = 0; x < hexString.length; x += 2) {
                strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
            }
        return strOut;    
    }
    
    static formatAddress(hex : string): string {
        return hex.replace('0x000000000000000000000000', '0x');
    }
    
    static formatDelta(totalSeconds: number): string{
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
}