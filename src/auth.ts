import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    isAdmin: boolean;
    allowedApps: string[];
    token?: string;
  }
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      allowedApps: string[];
      token: string;
    } & DefaultSession['user'];
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const API_URL = process.env.API_URL || 'http://localhost:5002';
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success && data.user) {
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              isAdmin: data.user.isAdmin,
              allowedApps: data.user.allowedApps,
              token: data.token,
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.allowedApps = user.allowedApps;
        token.accessToken = user.token; // Store backend JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.allowedApps = token.allowedApps as string[];
        session.user.token = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
