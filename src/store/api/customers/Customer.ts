export class Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  member_id: string;
  shipping: Shipping;
  billing: Billing;

  constructor(dto: any) {
    this.id = dto.id;
    this.email = dto.email;
    this.first_name = dto.first_name;
    this.last_name = dto.last_name;
    this.username = dto.username;
    this.member_id = dto.acf?.member_id;
    this.shipping = new Shipping(dto.shipping);
    this.billing = new Billing(dto.billing);
  }
}

class Shipping {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;

  constructor(dto: any) {
    this.first_name = dto.first_name;
    this.last_name = dto.last_name;
    this.company = dto.company;
    this.address_1 = dto.address_1;
    this.address_2 = dto.address_2;
    this.city = dto.city;
    this.country = dto.country;
    this.postcode = dto.postcode;
    this.country = dto.country;
  }
}

class Billing {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;

  constructor(dto: any) {
    this.first_name = dto.first_name;
    this.last_name = dto.last_name;
    this.company = dto.company;
    this.address_1 = dto.address_1;
    this.address_2 = dto.address_2;
    this.city = dto.city;
    this.postcode = dto.postcode;
    this.country = dto.country;
    this.email = dto.email;
    this.phone = dto.phone;
  }
}


