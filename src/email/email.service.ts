import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendPriceAlertEmail(
    chain: string,
    currentPrice: number,
    percentageChange?: number,
    isCustomAlertEmail?: boolean,
    alertEmail?: string,
  ) {
    const email =
      isCustomAlertEmail && alertEmail
        ? alertEmail
        : process.env.RECEIVER_EMAIL;
    const text =
      isCustomAlertEmail && alertEmail
        ? `${chain.toUpperCase()} price has reached the alert price ${Number(currentPrice).toFixed(2)}`
        : `${chain.toUpperCase()} price has increased by ${Number(percentageChange).toFixed(2)}%. The current price is $${Number(currentPrice).toFixed(2)}.`;

    await this.mailerService.sendMail({
      to: email,
      subject: `${chain.toUpperCase()} Price Alert: ${percentageChange ? `Increased by ${percentageChange.toFixed(2)}%` : ''}`,
      template: isCustomAlertEmail ? './custom_price_alert' : './price_alert',
      context: {
        chain,
        currentPrice,
        percentageChange,
      },
      text: text,
    });

    console.log(`Alert email sent to ${email} for ${chain}.`);
  }
}
