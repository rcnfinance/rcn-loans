export interface TooltipData {
  position: TooltipDataPosition;
  basic: TooltipDataBasic;
  style: TooltipDataStyle;
}

export interface TooltipDataPosition {
  visible: boolean;
  top: number;
  left: number;
}

export interface TooltipDataBasic {
  title: string;
  subtitle: string;
  display: TooltipDataDisplay;
  actions: Array<{title: string, method: () => void}>;
}

export interface TooltipDataStyle {
  color: string;
  background: string;
  width: number;
}

export enum TooltipDataDisplay {
  Top,
  Right,
  Bottom,
  Left
}
