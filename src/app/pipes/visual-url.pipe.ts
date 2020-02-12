import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'visualUrl'
})
export class VisualUrlPipe implements PipeTransform {

  transform(value: any): any {
    const url = value.split('://');
    return url[url.length - 1];
  }

}
