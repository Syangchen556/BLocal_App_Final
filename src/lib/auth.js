import { dbConnect } from './mongodb';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Auth configuration that can be used with both NextAuth v5 and getServerSession
export const authOptions = {
  providers: [
    CredentialsProvider({
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

        // Define test accounts for development/testing
        const testAccounts = {
          'admin@blocal.bt': { 
            password: 'admin123', 
            name: 'Admin User',
            role: 'ADMIN'
          },
          'seller1@blocal.bt': { 
            password: 'seller123', 
            name: 'Test Seller',
            role: 'SELLER'
          },
          'buyer1@blocal.bt': { 
            password: 'buyer123', 
            name: 'Test Buyer',
            role: 'BUYER'
          }
        };

        // Check if this is a test account
        if (testAccounts[credentials.email]) {
          const testAccount = testAccounts[credentials.email];
          
          // Verify password for test account
          if (credentials.password === testAccount.password) {
            console.log('Authenticated test account:', credentials.email);
            
            // Return a user object for the session
            return {
              id: credentials.email,
              email: credentials.email,
              name: testAccount.name,
              role: testAccount.role
            };
          } else {
            console.log('Invalid password for test account:', credentials.email);
            return null;
          }
        }
        
        // For non-test accounts, try to use the database
        try {
          await dbConnect();
          
          // Try to access the database, but handle it gracefully if it fails
          let user = null;
          try {
            const db = global.mongoose.connection.db;
            user = await db.collection('users').findOne({ email: credentials.email });
          } catch (dbError) {
            console.error('Database error when finding user:', dbError);
            // Fall back to test accounts if database fails
            return null;
          }

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          console.log('Attempting to verify password for:', credentials.email);
          
          // Try normal password verification
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordCorrect) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user._id?.toString();
        token.role = (user.role || '').trim().toUpperCase();
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = (token.role || '').trim().toUpperCase();
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

// NextAuth v5 configuration
export const auth = NextAuth(authOptions);

// For backward compatibility with existing code
export async function getAuthSession() {
  return await auth();
};

// Export auth as getServerSession for compatibility
export const getServerSession = getAuthSession;
