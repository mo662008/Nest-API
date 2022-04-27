import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'mohab@mail.com',
      password: '123',
    };
    describe('SignUp', () => {
      it('Throw expection if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.email,
          })
          .expectStatus(400);
        // .inspect();
      });

      it('Throw expection if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
        // .inspect();
      });

      it('Throw expection if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
        // .inspect();
      });

      it('Sign Up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect();
      });
    });
    describe('SignIn', () => {
      it('Throw expection if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.email,
          })
          .expectStatus(400);
        // .inspect();
      });

      it('Throw expection if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
        // .inspect();
      });

      it('Throw expection if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
        // .inspect();
      });

      it('Sign In', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
        // .inspect();
      });
    });
  });
  describe('User', () => {
    describe('GetMe', () => {
      it('Get the current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Mohab',
        lastName: 'Alnajjar',
        email: 'mohab@mail.com',
      };
      it('edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('Get bookmarks', () => {
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

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookamrk',
        link: 'www.google.com',
      };
      it('Create bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        description: 'First Descrition',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
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
