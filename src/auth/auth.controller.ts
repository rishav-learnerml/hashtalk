import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: { username: string; password: string }) {
    return this.authService.signup(body.username, body.password);
  }

  @Post('login')
  signin(@Body() body: { username: string; password: string }) {
    return this.authService.signin(body.username, body.password);
  }
}
