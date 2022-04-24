import { Body, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  logIn(dto: AuthDto) {
  }

  signUp() {
    return { msg: 'I am up' };
  }
}
