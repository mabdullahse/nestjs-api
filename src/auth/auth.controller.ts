import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('singup')
  singnup(@Body() dto: AuthDto) {
    return this.authService.singnup(dto);
  }

  @Post('singin')
  singnin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
