import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dto/auth'
import { supabase } from 'src/common/supabase.client';
import { createAccessToken, createRefreshToken } from 'src/utils/token';

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new BadRequestException(error.message);

    const accessToken = createAccessToken(email);
    const refreshToken = createRefreshToken(email);
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !userData?.user)
      throw new UnauthorizedException(`Invalid credentials: ${error?.message}`);

    const accessToken = createAccessToken(email);
    const refreshToken = createRefreshToken(email);
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  async refresh(supabaseRefreshToken: string) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: supabaseRefreshToken,
      });
      if (error) throw new UnauthorizedException(`Failed to refresh token: ${error.message}`);

      const accessToken = createAccessToken(data.user?.email);
      const refreshToken = createRefreshToken(data.user?.email);
      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (error) {
      throw new UnauthorizedException(`Failed to refresh token: ${error}`);
    }
  }
  async logout() {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw new UnauthorizedException(`Failed to logout: ${error.message}`);
    return { message: 'Logged out successfully' };
  }
}
