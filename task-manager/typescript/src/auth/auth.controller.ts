import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../dto/auth';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: 'Register a new user'})
  @ApiResponse({status: 201, description: 'User registered successfully'})
  @ApiBody({
    type: RegisterDto,
    description: 'Register a new user with email and password',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({summary: 'Sign in an existing user'})
  @ApiResponse({status: 201, description: 'User logged in successfully'})
  @ApiBody({
    type: LoginDto,
    description: 'Log in an existing user with email and password',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({summary: 'Update refresh token'})
  @ApiResponse({status: 200, description: 'Refresh token updated successfully'})
  @ApiBody({
    type: String,
    description: 'Register a new user with email and password',
  })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @ApiOperation({summary: 'Terminate session and log out'})
  async logout() {
    return this.authService.logout();
  }
}
