export class Abo {
  description: string;
  orders: { [customerId: string]: { articleId: string, quantity: number}[] }
  count: number;
  
  public constructor() {
    this.description = '';
    this.orders = {};
    this.count = 0;
  }
  
  addOrder(customerId: string, articleId: string, quantity: number) {
    this.orders[customerId] = this.orders[customerId] || [];
    this.orders[customerId].push({articleId, quantity});
    this.count++;
  }
}