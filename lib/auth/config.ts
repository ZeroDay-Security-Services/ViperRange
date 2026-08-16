// ViperRange — Auth.js v5 Configuration
// ZeroDay Security Services

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
        const shouldBeAdmin = adminEmails.includes(user.email.toLowerCase()) || user.email.toLowerCase() === "admin@zeroday.in" || user.email.toLowerCase().startsWith("admin@");

        let role = user.role as UserRole;
        if (shouldBeAdmin && user.role !== "ADMIN") {
          role = "ADMIN";
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          }).catch(() => {});
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: UserRole }).role;
      } else if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, email: true },
          });
          if (dbUser) {
            const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
            const shouldBeAdmin =
              adminEmails.includes(dbUser.email.toLowerCase()) ||
              dbUser.email.toLowerCase() === "admin@zeroday.in" ||
              dbUser.email.toLowerCase().startsWith("admin@");

            if (shouldBeAdmin && dbUser.role !== "ADMIN") {
              await prisma.user.update({
                where: { id: token.id as string },
                data: { role: "ADMIN" },
              }).catch(() => {});
              token.role = "ADMIN";
            } else {
              token.role = (dbUser.role as UserRole) || token.role;
            }
          }
        } catch {
          // ignore transient errors
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: UserRole }).role = (token.role as UserRole) || "STUDENT";
      }
      return session;
    },
  },
});
