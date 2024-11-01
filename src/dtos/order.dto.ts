export class AddressDto {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  postalCode: string;
}

export class CreateOrderDto {
  cartId: string;
  clientName: string;
  address: AddressDto;
}

export class CartItemDto {
  pizzaId: string;
  sizeId: string;
  quantity: number;
  toppings: string[];
}

export class UpdateCartItemDto {
  quantity: number;
}
