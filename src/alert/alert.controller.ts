import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert } from './entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('set-limit')
  async setPriceAlertLimit(@Body() dto: CreateAlertDto): Promise<Alert> {
    return await this.alertService.setPriceAlertLimit(dto);
  }

  @Patch('update-limit/:id')
  async updatePriceAlertLimit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertDto,
  ): Promise<Alert> {
    return await this.alertService.updatePriceAlertLimit(id, dto);
  }

  @Delete('delete-limit/:id')
  async deletePriceAlertLimit(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.alertService.deletePriceAlertLimit(id);
  }
}
