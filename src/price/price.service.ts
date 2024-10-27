import { Injectable } from '@nestjs/common';
import { Price } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { PricesListDto, TokeNames } from './dto/prices-list.dto';
import { RateService } from '../rate/rate.service';
import { EmailService } from '../email/email.service';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class PriceService {
  chains = ['ethereum', 'polygon'];

  constructor(
    private readonly rateService: RateService,
    @InjectRepository(Price) private priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
    private readonly alertService: AlertService,
  ) {}

  async fetchAndSavePrices() {
    try {
      for (const chain of this.chains) {
        const price = await this.rateService.fetchRate(chain);
        const priceRecord = new Price();
        priceRecord.chain = chain;
        priceRecord.price = price;
        try {
          await this.priceRepository.save(priceRecord);
          console.log(`Saved price for ${chain}: $${price}`);
        } catch (err) {
          console.log(`Failed to save price for ${chain}`);
        }
        await this.alertService.checkCustomPriceAlert(chain, Number(price));
      }
      await this.checkPriceIncrease();
    } catch (error) {
      console.log('Something went wrong', error?.message);
    }
  }

  async checkPriceIncrease() {
    for (const chain of this.chains) {
      const lastRecord = await this.priceRepository.findOne({
        where: { chain },
        order: { timestamp: 'DESC' }, // Get the most recent record
      });

      if (lastRecord) {
        const oneHourBeforeLastRecord = new Date(
          lastRecord.timestamp.getTime() - 60 * 60 * 1000,
        );

        const oneHourAgoRecord = await this.priceRepository.findOne({
          where: { chain, timestamp: LessThanOrEqual(oneHourBeforeLastRecord) },
          order: { timestamp: 'DESC' },
        });

        if (oneHourAgoRecord) {
          // Calculate the price change percentage
          const priceDifference = lastRecord.price - oneHourAgoRecord.price;
          const percentageChange =
            (priceDifference / oneHourAgoRecord.price) * 100;

          console.log(`Price change for ${chain}: ${percentageChange}%`);

          // If the price increased by more than 3%, send an email
          if (percentageChange > 3) {
            await this.emailService.sendPriceAlertEmail(
              chain,
              lastRecord.price,
              percentageChange,
            );
          }
        } else {
          console.log('No record found one hour before the last record');
        }
      } else {
        console.log('No last record found for the chain');
      }
    }
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
