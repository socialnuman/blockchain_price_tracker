import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { Price } from './price/entities';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { PriceModule } from './price/price.module';
import { RateModule } from './rate/rate.module';
import { EmailModule } from './email/email.module';
import { AlertModule } from './alert/alert.module';
import { Alert } from './alert/entity';
import { CronService } from './cron/cron.service';
import Moralis from 'moralis';

dotenv.config();

Moralis.start({
  apiKey:
    process?.env?.MORALIS_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImFhMDBiMzZjLTFmZWYtNDA2Yy04OTIyLTBlY2YxMjgwOGMwNyIsIm9yZ0lkIjoiMjM0MjQ0IiwidXNlcklkIjoiMjM1NDIyIiwidHlwZUlkIjoiYzg2Y2VkMTUtOTRjNS00Mzc5LWJiMzgtZTFmY2E0MzUxYzBjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzAwMjY1NzQsImV4cCI6NDg4NTc4NjU3NH0.W3JAQPS53__4hBiNt6LqmRk52EQGvJt9v2kClYYJ2qE',
});

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    PriceModule,
    RateModule,
    EmailModule,
    AlertModule,
    TypeOrmModule.forFeature([Price, Alert]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Price, Alert],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <your-email@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [CronService],
})
export class AppModule {}
