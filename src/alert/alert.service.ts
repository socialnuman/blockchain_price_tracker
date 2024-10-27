import { Injectable, NotFoundException } from '@nestjs/common';
import { Alert } from './entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private emailService: EmailService,
  ) {}

  public async setPriceAlertLimit(dto: CreateAlertDto): Promise<Alert> {
    try {
      return this.alertRepository.save({
        ...dto,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updatePriceAlertLimit(id: number, dto: UpdateAlertDto): Promise<Alert> {
    try {
      const alert = await this.alertRepository.findOne({
        where: { id },
      });

      if (!alert) {
        throw new NotFoundException('Price email not found');
      }

      alert.dollar = dto.dollar;
      alert.chain = dto.chain;
      alert.email = dto.email;

      return this.alertRepository.save(alert);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deletePriceAlertLimit(id: number): Promise<boolean> {
    try {
      const alert = await this.alertRepository.findOne({
        where: { id },
      });

      if (!alert) {
        throw new NotFoundException('Price email not found');
      }

      await this.alertRepository.remove(alert);
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async checkCustomPriceAlert(chain: string, value: number) {
    const checkPrice = await this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.chain = :chain', { chain })
      .andWhere('alert.dollar <= :value', { value: Math.floor(value) }) // Change the comparison to <=
      .getOne();

    if (checkPrice) {
      await this.emailService.sendPriceAlertEmail(
        chain,
        value,
        0,
        true,
        checkPrice?.email,
      );
    }
    return;
  }
}
