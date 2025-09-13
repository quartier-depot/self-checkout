export class Barcode {
  
  public isWeightEncoded: boolean;
  
  constructor(public code: string) {
    this.isWeightEncoded = Barcode.isWeightEncoded(this.code);
  }
  
  static isUrl( code: string): boolean {
    return code.startsWith('https://');
  }

  static isWeightEncoded(code: string): boolean {
    return code.endsWith('wc');
  }

  matches(code: string): boolean {
    if (this.isWeightEncoded) {
      const charsRemoved = this.code.replace(/[a-z]/g, '');
      return this.code.length === code.length && code.startsWith(charsRemoved);
    }
    return this.code === code;
  }

  getQuantity(code: string): number {
    if (this.isWeightEncoded) {
      const prefix = this.code.replace(/[a-z]/g, '');
      const weightStr = code.substring(prefix.length, code.length-1);
      return parseInt(weightStr, 10);
    }
    return 1;
  }
}