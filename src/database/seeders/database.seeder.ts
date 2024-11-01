import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pizza, PizzaTopping, Size } from '../../entities';
import { pizzasData } from './data/pizzas.data';
import { toppingsData } from './data/toppings.data';
import { sizesData } from './data/sizes.data';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(Pizza)
    private pizzaRepository: Repository<Pizza>,
    @InjectRepository(PizzaTopping)
    private toppingRepository: Repository<PizzaTopping>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async seed() {
    // Clear all existing data
    await this.clearTables();

    // Seed new data
    await this.seedPizzas();
    await this.seedToppings();
    await this.seedSizes();
  }

  private async clearTables() {
    // Delete in reverse order of dependencies
    await this.toppingRepository.delete({});
    await this.pizzaRepository.delete({});
    await this.sizeRepository.delete({});
  }

  private async seedPizzas() {
    for (const pizzaData of pizzasData) {
      const pizza = this.pizzaRepository.create(pizzaData);
      await this.pizzaRepository.save(pizza);
    }
  }

  private async seedToppings() {
    for (const toppingData of toppingsData) {
      const topping = this.toppingRepository.create(toppingData);
      await this.toppingRepository.save(topping);
    }
  }

  private async seedSizes() {
    for (const sizeData of sizesData) {
      const size = this.sizeRepository.create(sizeData);
      await this.sizeRepository.save(size);
    }
  }
}
