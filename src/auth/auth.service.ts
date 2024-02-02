import { ForbiddenException, Injectable } from '@nestjs/common';

import { hash, verify } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async singnup(dto: AuthDto) {
    console.log(dto);

    const hashPassword = await hash(dto.password);

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash: hashPassword,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is already taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Email not found');
    }

    try {
      const isMatchPassword = await verify(user.hash, dto.password);

      if (isMatchPassword) {
        delete user.hash;
        return user;
      } else {
        throw new ForbiddenException('Password is incorect');
      }
    } catch (error) {
      throw new ForbiddenException('Password is incorect');
    }
  }
}
