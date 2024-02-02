import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { hash, verify } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async singnup(dto: AuthDto) {
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
        return this.singnToken(user.id, user.email);
      } else {
        throw new ForbiddenException('Password is incorect');
      }
    } catch (error) {
      throw new ForbiddenException('Password is incorect');
    }
  }

  async singnToken(
    userId: number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = { sub: userId, email };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('SECRET_TOKEN'),
    });

    return {
      access_token,
    };
  }
}
