import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../constants';
import { HttpService } from '@nestjs/axios';
import process from 'node:process';
import Moralis from 'moralis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    ) {}

  async fetchRate(chain: string): Promise<number> {
    const address =
      chain === 'ethereum'
        ? this.configService.get<string>('ETHEREUM_ADDRESS')
        : this.configService.get<string>('POLYGON_ADDRESS')
    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: address,
    });

    return Number(response?.raw?.usdPrice || 0);
  }

  async getEthToBtcRate(): Promise<number> {
    const apiUrl = API_URL('ethereum', 'btc');
    try {
      const response: any = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            accept: 'application/json',
            // 'x-cg-pro-api-key': process.env.CG_PRO_API_KEY,
          },
        }),
      );
      return response?.data?.ethereum?.btc || 0;
    } catch (error) {
      console.error('Failed to fetch ETH to BTC rate:', error);
      return 0;
    }
  }

  async getEthToUsdRate(): Promise<number> {
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: this.configService.get<string>('ETHEREUM_ADDRESS')
      });

      return Number(response?.raw?.usdPrice || 0);
    } catch (error) {
      console.error('Failed to fetch ETH to USD rate:', error);
      return 0;
    }
  }
}
