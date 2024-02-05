import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        link: dto.link,
        description: dto.description,
        title: dto.title,
        userId,
      },
    });

    return bookmark;
  }

  async getAllBookmark(userId: number) {
    const bookmarkall = await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });

    return bookmarkall;
  }

  async getAllBooksById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resouces is not found');
    }

    return bookmark;
  }

  async updateBookmar(userId, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark1 = await this.prismaService.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });

    if (!bookmark1 || bookmark1.userId !== userId) {
      throw new ForbiddenException('Access to resouces is prohibited');
    }
    const bookmark = await this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
    return bookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
