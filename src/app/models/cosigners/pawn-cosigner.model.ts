import { CosignerDetail } from '../cosigner.model';
import { AssetItem } from '../asset.model';

export class PawnCosigner extends CosignerDetail {
  constructor(
    public id: number,
    public bundle: number,
    public assets: AssetItem[],
    public status: number,
  ) {
    super();
  }
}
