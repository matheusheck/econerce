import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import { response } from 'express';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProductResponse {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findProducts = await this.productsRepository.findAllById(products)

    const shop = [] as IProductResponse[];

    findProducts.forEach(item =>{
      const orderProduct = products.findIndex(product => product.id ===item.id);

      shop.push({
        product_id: item.id,
        price: item.price,
        quantity: findProducts[orderProduct].quantity
      })
    })

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found')
    }

    const order = this.ordersRepository.create({ customer, products: shop });

    return order;
  }
}

export default CreateOrderService;
