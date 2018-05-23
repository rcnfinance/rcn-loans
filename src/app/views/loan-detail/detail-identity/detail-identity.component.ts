import { Component, OnInit, Input } from '@angular/core';
import { CosignerDetail } from './../../../models/cosigner.model';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-detail-identity',
  templateUrl: './detail-identity.component.html',
  styleUrls: ['./detail-identity.component.scss']
})
export class DetailIdentityComponent implements OnInit {
  @Input() cosignerDetail: CosignerDetail;
  identity: any;
  constructor(
    private route: ActivatedRoute
  ) { }

  hasIdentity(): any {
    if (this.identity === undefined) {console.log(this.identity); return undefined; } else {
      console.log(this.identity);
      return true;
    }
  }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      console.log(id);
   });
  }
}
