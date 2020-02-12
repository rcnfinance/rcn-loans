import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from './../utils/utils';

@Pipe({
  name: 'formatAmount'
})
export class FormatAmountPipe implements PipeTransform {

  transform(value: any): any {
    return Utils.formatAmount(Number(value));
  }

}
