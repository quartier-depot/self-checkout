import { useMutation } from '@tanstack/react-query';
import { useApi, WooCommerceRestApi } from '../useApi';
import { Customer } from '../customers/Customer';
import { Cart } from './Cart';

export function useCreateOrder() {
  const api = useApi();
  return useMutation({
    mutationFn: async (param: { customer: Customer; cart: Cart }) =>
      createOrder(api, param.customer, param.cart),
  });
}

async function createOrder(api: WooCommerceRestApi, customer: Customer, cart: Cart) {
  const order = {
    status: 'pending',
    customer_id: customer.id,
    shipping: customer.shipping,
    line_items: cart.items.map((item) => ({
      name: item.product.name,
      product_id: item.product.id,
      quantity: item.quantity,
    })),
  };

  const response = await api.post('orders', order);
  return { orderId: response.data.id as string, orderTotal: Number.parseFloat(response.data.total) };
}
