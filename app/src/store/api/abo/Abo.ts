
export interface Abo {
  description: string;
  orders: { [customerId: string]: { articleId: string, quantity: number}[] }
  count: number;
}

export function createAbo(): Abo {
  return {
    description: '',
    orders: {},
    count: 0,
  }
}

export function addOrder(abo: Abo, customerId: string, articleId: string, quantity: number): void {
    abo.orders[customerId] = abo.orders[customerId] || [];
    abo.orders[customerId].push({articleId, quantity});
    abo.count++;
}