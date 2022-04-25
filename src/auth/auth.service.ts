import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  logIn(dto: AuthDto) {
  }

  async signUp(dto: AuthDto) {
    // Generate password hash
    const hash = await argon.hash(dto.password);
    // Save user to DB
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash
      }
    });
    console.log("IN")
    // Return saved user
    return user;
  }
}
