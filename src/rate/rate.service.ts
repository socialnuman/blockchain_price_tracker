import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../constants';
import { HttpService } from '@nestjs/axios';
import process from 'node:process';
import Moralis from 'moralis';

@Injectable()
export class RateService {
  constructor(private httpService: HttpService) {}

  async fetchRate(chain: string): Promise<number> {
    const address =
      chain === 'ethereum'
        ? process?.env?.ETHEREUM_ADDRESS ||
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        : process?.env?.POLYGON_ADDRESS ||
          '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';
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
        address:
          process?.env?.ETHEREUM_ADDRESS ||
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      });

      return Number(response?.raw?.usdPrice || 0);
    } catch (error) {
      console.error('Failed to fetch ETH to USD rate:', error);
      return 0;
    }
  }
}
