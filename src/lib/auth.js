import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    {
      id: 'credentials',
      type: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          const db = await connectDB();
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            console.log('Password incorrect for user:', credentials.email);
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id?.toString();
        token.role = (user.role || '').trim().toLowerCase();
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = (token.role || '').trim().toLowerCase();
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin?error=CredentialsSignin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret',
};
