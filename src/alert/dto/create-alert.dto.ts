import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  dollar: number;

  @IsNotEmpty()
  @IsString()
  chain: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
