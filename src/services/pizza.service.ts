import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pizza, PizzaTopping, Size } from '../entities';

@Injectable()
export class PizzaService {
  constructor(
    @InjectRepository(Pizza)
    private pizzaRepository: Repository<Pizza>,
    @InjectRepository(PizzaTopping)
    private toppingRepository: Repository<PizzaTopping>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async findAll({
    inStock,
    sortBy,
  }: {
    inStock?: boolean;
    sortBy?: 'name' | 'price';
  }) {
    const queryBuilder = this.pizzaRepository.createQueryBuilder('pizza');

    if (inStock !== undefined) {
      queryBuilder.where('pizza.stock > 0');
    }

    if (sortBy) {
      queryBuilder.orderBy(`pizza.${sortBy}`, 'ASC');
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const pizza = await this.pizzaRepository.findOne({ where: { id } });
    if (!pizza) {
      throw new NotFoundException('Pizza not found');
    }
    return pizza;
  }

  async findAllToppings() {
    return this.toppingRepository.find({
      where: { isActive: true },
    });
  }

  async findAllSizes() {
    return this.sizeRepository.find();
  }
}
