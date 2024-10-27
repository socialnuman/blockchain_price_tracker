import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), EmailModule],
  providers: [AlertService, EmailService],
  controllers: [AlertController],
  exports: [AlertService], // Exporting PriceService if needed elsewhere
})
export class AlertModule {}
