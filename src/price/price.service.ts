import { Injectable } from '@nestjs/common';
import { Price } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricesListDto, TokeNames } from './dto/prices-list.dto';
import { RateService } from '../rate/rate.service';

@Injectable()
export class PriceService {
  constructor(
    private readonly rateService: RateService,
    @InjectRepository(Price) private priceRepository: Repository<Price>
  ) {}

  async addPrice (chain: string, price: number) {
    const priceRecord = new Price();
    priceRecord.chain = chain;
    priceRecord.price = price;
    await this.priceRepository.save(priceRecord);
  }

  async findOne(whereClause: Record<string, any>) {
    return await this.priceRepository.findOne(whereClause)
  }

  async getHourlyPrices(chain?: string): Promise<PricesListDto> {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const query = this.priceRepository
        .createQueryBuilder('price')
        .where('price.timestamp BETWEEN :start AND :end', {
          start: twentyFourHoursAgo,
          end: now,
        });

      // Apply chain filter if provided
      if (chain) {
        query.andWhere('price.chain = :chain', { chain });
      }

      query.orderBy('price.timestamp', 'ASC');

      const prices = await query.getMany();

      if (!chain) {
        return prices?.reduce((result, price) => {
          if (!result[price?.chain]) {
            result[price?.chain] = [];
          }
          result[price?.chain].push(price);
          return result;
        }, {});
      } else if (chain === TokeNames.ETHEREUM) {
        return { ethereum: prices };
      } else {
        return { polygon: prices };
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCurrentRates(): Promise<{
    ethToBtcRate: number;
    ethToUsdRate: number;
  }> {
    try {
      const ethToBtcRate = await this.rateService.getEthToBtcRate();
      const ethToUsdRate = await this.rateService.getEthToUsdRate();

      return { ethToBtcRate, ethToUsdRate };
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
