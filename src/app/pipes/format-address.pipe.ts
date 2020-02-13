import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatAddress'
})
export class FormatAddressPipe implements PipeTransform {

  transform(address: string): any {
    if (typeof address === 'string' && address.length) {
      return `${ address.substr(0, 4) }...${ address.substr(-4) }`;
    }

    return '-';
  }

}
