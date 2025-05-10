import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { findOrCreateGoogleUser } from "../services/auth.service";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "https://redibo-back-wtt.vercel.app/api/auth/google/callback",
    },

    async (_accessToken, _refreshToken, profile, done) => {
      console.log("🔵 Iniciando autenticación Google - Perfil recibido:", JSON.stringify(profile, null, 2)); // 👈 Log 1
      try {
        const email = profile.emails?.[0].value;
        const name = profile.displayName;

        console.log("📧 Email obtenido de Google:", email); // 👈 Log 2
        if (!email)
          return done(new Error("No se pudo obtener el email de Google"), false);
        console.log("🔄 Buscando/creando usuario en DB...");
        const user = await findOrCreateGoogleUser(email, name);

        if (!user.id_usuario) {
          return done(null, false, {
            message: "No se pudo obtener el ID del usuario",
          });
        }

        console.log("✅ Usuario autenticado:", JSON.stringify(user, null, 2));
        return done(null, user);
      } catch (error: any) {
        if (error.name === "EmailAlreadyRegistered") {
          return done(null, false, { message: error.message });
        }

        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.email); // 👈 guardamos solo el email
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
