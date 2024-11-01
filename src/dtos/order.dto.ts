import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  ValidateNested,
  Max,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  street: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}(-\d{4})?$/, {
    message: 'Invalid postal code format. Must be like 12345 or 12345-6789',
  })
  postalCode: string;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  cartId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  clientName: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;
}

export class CartItemDto {
  @IsUUID()
  @IsNotEmpty()
  pizzaId: string;

  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsNotEmpty()
  @Min(1)
  @Max(99)
  quantity: number;

  @IsArray()
  @IsUUID('4', { each: true })
  toppings: string[];
}

export class UpdateCartItemDto {
  @IsNotEmpty()
  @Min(0)
  @Max(99)
  quantity: number;
}
