export class Abo {
  description: string;
  orders: { [customerId: string]: { articleId: string, quantity: number}[] }
  
  public constructor() {
    this.description = '';
    this.orders = {};
  }
  
  addOrder(customerId: string, articleId: string, quantity: number) {
    this.orders[customerId] = this.orders[customerId] || [];
    this.orders[customerId].push({articleId, quantity});
  }
}