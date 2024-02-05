import { IsEmail, IsOptional, IsString, isString } from 'class-validator';

export class EditUser {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
