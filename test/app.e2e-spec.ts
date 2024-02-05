import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUser } from 'src/user/dto/edit-user.dto';
import { EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDB();

    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'afasd@s.com',
      password: '1234',
    };

    describe('signup', () => {
      it('It should singup', () => {
        return pactum
          .spec()
          .post('/auth/singup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('It should not work if emai is missing', () => {
        return pactum
          .spec()
          .post('/auth/singup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('It should not work if no password', () => {
        return pactum
          .spec()
          .post('/auth/singup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('It should not work if no body', () => {
        return pactum
          .spec()
          .post('/auth/singup')
          .withBody({})
          .expectStatus(400);
      });
    });

    describe('signin', () => {
      it('It should singin', () => {
        return pactum
          .spec()
          .post('/auth/singin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Get the user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('It Should Update user', () => {
        const updto: EditUser = {
          email: 'afasd@s.com',
          firstName: 'firstName 1234',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(updto)
          .expectStatus(200)
          .expectBodyContains(updto.firstName);
      });
    });
  });

  describe('Bookmark', () => {
    const updatedBody = {
      link: 'https://www.prisma.io/docs/orm/prisma-client/queries/crud#update',
      description: ' dto.description',
      title: 'dto.title',
    };
    describe('Get Bookmarks empty', () => {
      it('Get Empty Bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Creat Bookmark', () => {
      it('Create Bookmar', () => {
        return (
          pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .withBody(updatedBody)
            .expectStatus(201)
            // .expectJsonLength(1) used in gey by id
            .stores('bookmarkId', 'id')
            .inspect()
        );
      });
    });

    describe('Get Bookmark by id', () => {
      it('Get bookmark by id', () => {
        return (
          pactum
            .spec()
            .get('/bookmarks/{id}')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .withPathParams('id', '$S{bookmarkId}')
            .expectStatus(200)
            // .expectJsonLength(1)
            .expectBodyContains('$S{bookmarkId}')
            .inspect()
        );
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
