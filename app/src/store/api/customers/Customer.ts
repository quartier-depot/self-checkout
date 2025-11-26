import { decode } from 'html-entities';

export function createCustomer(dto:any) {
  return {
    id : dto.id,
    email :dto.email,
    first_name: decode(dto.first_name),
    last_name: decode(dto.last_name),
    username: dto.username,
    member_id: dto.acf?.member_id,
    shipping: createShipping(dto.shipping),
    billing: createBilling(dto.billing),
  }
}

function createShipping(dto: any): Shipping {
  return {
    first_name: decode(dto.first_name),
    last_name: decode(dto.last_name),
    company: decode(dto.company),
    address_1: decode(dto.address_1),
    address_2: decode(dto.address_2),
    city: dto.city,
    country: dto.country,
    postcode: dto.postcode
  }
}

function createBilling(dto: any): Billing {
  return {
    first_name: decode(dto.first_name),
    last_name: decode(dto.last_name),
    company: decode(dto.company),
    address_1: decode(dto.address_1),
    address_2: decode(dto.address_2),
    city: dto.city,
    postcode: dto.postcode,
    country: dto.country,
    email: dto.email,
    phone: dto.phone,
  }
}

export interface Customer {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  username: string,
  member_id: string,
  shipping: Shipping,
  billing: Billing,
}

interface Shipping {
  first_name: string,
  last_name: string,
  company: string,
  address_1: string,
  address_2: string,
  city: string,
  postcode: string,
  country: string,
}

interface Billing {
  first_name: string,
  last_name: string,
  company: string,
  address_1: string,
  address_2: string,
  city: string,
  postcode: string,
  country: string,
  email: string,
  phone: string,
}


