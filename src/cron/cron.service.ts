import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceService } from '../price/price.service';

@Injectable()
export class CronService {
  constructor(private priceService: PriceService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.priceService.fetchAndSavePrices();
  }
}
