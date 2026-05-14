import LogUtil from '../utils/LogUtil';
import LogMethod from './LogDecorator';

export interface IStyleData {
  backgroundColor: string,
  opacity: number
};

export interface IUpdateStyle {
  registerUpdateStyleFunction: Function,
  removeUpdateStyleFunction: Function
};

export class WindowStyle {
  private static TAG: string = '[WindowStyle]';
  private static styleDataMap: Map<string, IStyleData> = new Map();
  private static updateStyleFuncMap: Map<string, (style: IStyleData) => void> = new Map();

  @LogMethod
  static registerUpdateStyleFunction(id: string, initStyle: IStyleData, func: (style: IStyleData) => void): void {
    LogUtil.info(WindowStyle.TAG, 'registerUpdateStyleFunction ' + id);
    WindowStyle.updateStyleFuncMap.set(id, func);
    WindowStyle.styleDataMap.set(id, initStyle);
  }

  @LogMethod
  static removeUpdateStyleFunction(id: string): void {
    LogUtil.info(WindowStyle.TAG, 'removeUpdateStyleFunction ' + id);
    WindowStyle.updateStyleFuncMap.delete(id);
    WindowStyle.styleDataMap.delete(id);
  }

  private static idNormalization(id: string | number): string {
    return typeof id === 'number' ? 'browser' + id : id.toString();
  }

  static getUpdateStyleFunc(id: string | number): Function | undefined {
    let key = WindowStyle.idNormalization(id);
    return WindowStyle.updateStyleFuncMap.get(key);
  }

  @LogMethod
  static getStyleData(id: string | number): IStyleData | undefined {
    let key = WindowStyle.idNormalization(id);
    return WindowStyle.styleDataMap.get(key);
  }

  @LogMethod
  static updateStyleData(id: string | number, styleDate: IStyleData): void {
    let key = WindowStyle.idNormalization(id);
    WindowStyle.styleDataMap.set(key, styleDate);
  }

  @LogMethod
  static decimalColorToHex(decimalColor: number): string {
    let hexColor = decimalColor.toString(16).padStart(8, '0');
    return hexColor;
  }

  @LogMethod
  static hexColorToDecimal(hexColor: string): number {
    let decimalColor = parseInt(hexColor, 16);
    return decimalColor;
  }

  @LogMethod
  static getColorAlpha(decimalColor: number): number {
    return (decimalColor >>> 24) / 255;
  }

  @LogMethod
  static decimalOpacityToHex(decimalOpacity: number): string {
    let hexOpacity = Math.round(decimalOpacity * 255).toString(16).padStart(2, '0');
    return hexOpacity;
  }
};
