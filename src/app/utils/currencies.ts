
export class Currency {
    static getDecimals(currency: string): number{
        switch (currency.toUpperCase()) {
            case "ARS":
                return 2;
            
            case "MANA":
            case "ETH":
            case "RCN":
                return 18;

            case "BTC":
            case "BCH":
                return 8;

            default:
                return 0;
        }
    }    
}