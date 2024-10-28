import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceService } from '../price/price.service';
import { EmailService } from '../email/email.service';
import { CHAINS } from '../constants';
import { RateService } from '../rate/rate.service';
import { AlertService } from '../alert/alert.service';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    private priceService: PriceService,
    private emailService: EmailService,
    private rateService: RateService,
    private alertService: AlertService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchPricesAndSendAlertEmail() {
    try {
      for (const chain of CHAINS) {
        const price = await this.rateService.fetchRate(chain);
        try {
          await this.priceService.addPrice(chain, price);
          console.log(`Saved price for ${chain}: $${price}`);
        } catch (err) {
          console.log(`Failed to save price for ${chain}`);
        }
        await this.alertService.checkCustomPriceAlert(chain, price);
      }
      await this.checkPriceIncrease();
    } catch (error) {
      console.log('Something went wrong', error?.message);
    }
  }

  async checkPriceIncrease() {
    for (const chain of CHAINS) {
      const lastRecord = await this.priceService.findOne({
        where: { chain },
        order: { timestamp: 'DESC' }, // Get the most recent record
      });

      if (lastRecord) {
        const oneHourBeforeLastRecord = new Date(
          lastRecord.timestamp.getTime() - 60 * 60 * 1000,
        );

        const oneHourAgoRecord = await this.priceService.findOne({
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

}

