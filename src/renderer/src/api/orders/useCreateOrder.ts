import { useMutation } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { Customer } from '../customers/Customer';
import { Cart } from './Cart';

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (param: { customer: Customer; cart: Cart }) =>
      createOrder(param.customer, param.cart)
  });
}

async function createOrder(customer: Customer, cart: Cart) {
  const api = useApi();

  const order = {
    status: 'pending',
    customer_id: customer.id,
    shipping: customer.shipping,
    line_items: cart.items.map((item) => ({
      name: item.product.name,
      product_id: item.product.id,
      quantity: item.quantity
    }))
  };

  const response = await api.post('orders', order);
  return { orderId: response.data.id as string, orderTotal: Number.parseFloat(response.data.total) };
}
