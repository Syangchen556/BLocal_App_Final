import { auth } from "../../../../lib/auth";

// In NextAuth v5, we export the handlers directly from the auth configuration
export const { GET, POST } = auth;