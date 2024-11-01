import { IsUUID, IsInt, IsArray, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  pizzaId: string;

  @IsUUID()
  sizeId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsUUID('4', { each: true })
  toppings: string[];
}

export class UpdateCartItemQuantityDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
