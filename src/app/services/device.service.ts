import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  isMobile(): boolean {
    let isMobile: boolean;

    try {
      const MOBILE_RESOLUTION_PX = 992;
      isMobile = window.innerWidth <= MOBILE_RESOLUTION_PX;
    } catch {
      isMobile = false;
    }

    return isMobile;
  }
}
