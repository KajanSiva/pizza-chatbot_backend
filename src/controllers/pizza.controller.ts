import { Controller, Get, Query, Param } from '@nestjs/common';
import { PizzaService } from '../services/pizza.service';
import { FindAllPizzasQueryDto } from '../dtos/pizza.dto';

@Controller('api/pizzas')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get()
  async findAll(@Query() query: FindAllPizzasQueryDto) {
    return this.pizzaService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pizzaService.findOne(id);
  }
}

@Controller('api/toppings')
export class ToppingController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get()
  async findAllToppings() {
    return this.pizzaService.findAllToppings();
  }
}

@Controller('api/sizes')
export class SizeController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get()
  async findAllSizes() {
    return this.pizzaService.findAllSizes();
  }
}
