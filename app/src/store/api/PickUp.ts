
export interface PickUp {
  lists: List[]
}

export interface List { id: number, title: string, description: string, delivery: string, customers: { customer_id: number, preorders: { product_id: string, amount: string, quantity: string}[] }[] }
