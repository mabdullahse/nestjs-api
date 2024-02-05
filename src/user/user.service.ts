import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUser } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async editUser(userId: number, editUser: EditUser) {
    const updated = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...editUser,
      },
    });
    delete updated.hash;

    return updated;
  }
}
