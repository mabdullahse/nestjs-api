import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { EditUser } from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User, @GetUser('email') email: string) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() editUser: EditUser) {
    return this.userService.editUser(userId, editUser);
  }
}
