import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      image?: string | null;
      empresaId: string;
      empresaNome: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    image?: string | null;
    empresaId: string;
    empresaNome: string;
  }
}
