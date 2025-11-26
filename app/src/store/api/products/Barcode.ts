export class Barcode {
  
  static isUrl( code: string): boolean {
    return code.startsWith('https://');
  }

  static isWeightEncoded(code: string): boolean {
    return code.endsWith('wc');
  }

  static matches(code: string, otherCode: string): boolean {
    if (Barcode.isWeightEncoded(code)) {
      const charsRemoved = code.replace(/[a-z]/g, '');
      return code.length === otherCode.length && otherCode.startsWith(charsRemoved);
    }
    return code === otherCode;
  }

  static getQuantity(code: string, otherCode: string): number {
    if (Barcode.isWeightEncoded(code)) {
      const prefix = code.replace(/[a-z]/g, '');
      const weightStr = otherCode.substring(prefix.length, otherCode.length-1);
      return parseInt(weightStr, 10);
    }
    return 1;
  }
}