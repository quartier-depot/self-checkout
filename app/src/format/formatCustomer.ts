export function formatCustomer(customer: { first_name: string, last_name: string } | null | undefined): string {
  return customer ? `${customer?.first_name} ${customer?.last_name}` : '';
}
