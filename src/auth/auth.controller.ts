import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('singup')
  singnup(@Body() dto: AuthDto) {
    return this.authService.singnup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('singin')
  singnin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
