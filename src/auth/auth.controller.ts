import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: AuthDto) {
    return this.authService.logIn(dto);
  }
  // signIn(@Body() dto: AuthDto) {

  // signIn(
  //   @Body('email') email: String,
  //   @Body('password', ParseIntPipe) password: String,
  // ) {

  @Post('signup')
  signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }
}
