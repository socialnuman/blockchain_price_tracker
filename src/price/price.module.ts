import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { HttpModule } from '@nestjs/axios';
import { Price } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateService } from '../rate/rate.service';
import { EmailService } from '../email/email.service';
import { AlertService } from '../alert/alert.service';
import { AlertModule } from '../alert/alert.module';
import { EmailModule } from '../email/email.module';
import { Alert } from '../alert/entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Price, Alert]),
    HttpModule,
    AlertModule,
    EmailModule,
  ],
  providers: [PriceService, RateService, EmailService, AlertService],
  controllers: [PriceController],
  exports: [PriceService], // Exporting PriceService if needed elsewhere
})
export class PriceModule {}
