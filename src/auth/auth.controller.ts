import { Body, Controller, ParseIntPipe, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  // signIn(@Body() dto: AuthDto) {

  // signIn(
  //   @Body('email') email: String,
  //   @Body('password', ParseIntPipe) password: String,
  // ) {
  signIn(@Body() dto: AuthDto) {
    return this.authService.logIn(dto);
  }

  @Post('signup')
  signUp() {
    return this.authService.signUp();
  }
}
