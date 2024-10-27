import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiQuery } from '@nestjs/swagger';
import { PricesListDto } from './dto/prices-list.dto';

@Controller('price')
export class PriceController {
  constructor(private readonly pricesService: PriceService) {}

  // Endpoint to get price within the last 24 hours for a specific chain
  @Get('hourly')
  @ApiQuery({
    name: 'chain',
    required: false,
    description: 'The blockchain to filter by (optional)',
  })
  async getHourlyPrices(
    @Query('chain') chain?: string,
  ): Promise<PricesListDto> {
    return await this.pricesService.getHourlyPrices(chain?.toLowerCase());
  }

  @Get('eth-to-btc')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    // Get the current rates for ETH to BTC and ETH to USD
    const { ethToBtcRate, ethToUsdRate } =
      await this.pricesService.getCurrentRates();

    // Calculate the total fee (3% of the input ETH)
    const feePercentage = 0.03;
    const feeEth = ethAmount * feePercentage;
    const feeUsd = feeEth * ethToUsdRate;

    // Subtract the fee from the input ETH to get the effective ETH amount for swap
    const effectiveEthAmount = ethAmount - feeEth;

    // Calculate the amount of BTC the user will receive after the fee
    const btcAmount = effectiveEthAmount * ethToBtcRate;

    // Return the results
    return {
      btcAmount,
      fee: {
        eth: feeEth,
        usd: feeUsd,
      },
    };
  }
}
