import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

interface GitHubProfile {
  id: string;
  username: string;
  emails?: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-client-secret',
      callbackURL: 'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
    done: (err: Error | null, user?: Record<string, unknown>) => void,
  ) {
    const { id, username, emails } = profile;
    const email = emails?.[0]?.value;

    const user = {
      id,
      username,
      email,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
