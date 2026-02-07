import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/lib/prisma";
import { authSecret } from "@/lib/auth-secret";

export const authOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!prisma.user) {
          return null;
        }

        const loginId = String(credentials?.loginId ?? "").trim();
        const password = String(credentials?.password ?? "").trim();
        if (!loginId || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { name: loginId },
        });
        if (!user?.passwordHash) {
          return null;
        }

        const isMatched = await bcrypt.compare(password, user.passwordHash);
        if (!isMatched) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          userType: user.userType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.userType = token.userType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
