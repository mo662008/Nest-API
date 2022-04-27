import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { config } from 'process';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async logIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');
    const pwWatches = await argon.verify(user.password, dto.password);
    if (!pwWatches) throw new ForbiddenException('Credentials incorrect');
    return this.signToken(user.id, user.email);
  }

  async signUp(dto: AuthDto) {
    // Generate password hash
    const hash = await argon.hash(dto.password);
    // Save user to DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      delete user.password;
      // Return saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if ((error.code = 'P2002')) {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
    throw error;
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
