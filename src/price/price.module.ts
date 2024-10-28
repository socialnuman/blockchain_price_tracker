import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateService } from '../rate/rate.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), HttpModule],
  providers: [PriceService, RateService],
  controllers: [PriceController],
  exports: [PriceService], // Exporting PriceService if needed elsewhere
})
export class PriceModule {}
