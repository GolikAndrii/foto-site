import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google()],
  callbacks: {
    signIn({ profile }) {
      return profile?.email === process.env.ADMIN_EMAIL;
    },
    session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
});
