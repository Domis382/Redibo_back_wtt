// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, getUserProfile } from "../controllers/auth.controller"; // 👈 IMPORTA BIEN AQUÍ
import { validateRegister } from "../middlewares/validateRegister"; // 👈 IMPORTAR middleware de validación
import { validateLogin } from "../middlewares/validateLogin";
import passport from "passport";
import { updateGoogleProfile } from "../controllers/auth.controller";
import { checkPhoneExists } from "../controllers/auth.controller";
import { me } from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";
/* import { isAuthenticated } from "../middlewares/isAuthenticated"; */

//foto de perfil eliminar/actualizar
import {deleteProfilePhoto,uploadProfilePhoto,upload,} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

//Editar nombre completo
import { updateUserField } from "../controllers/auth.controller"; // 👈 IMPORTA
import { generateToken } from "../utils/generateToken"; // Asegúrate de tener esto arriba

const router = Router();

router.post("/google/complete-profile", updateGoogleProfile);

//nombre completo
router.put("/user/update", authMiddleware, updateUserField);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/* router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://34.69.214.55:3000?error=google",
    session: true,
  }),
  (req, res) => {
    // 🔥 Redirige al front para que abra el modal de completar perfil
    res.redirect("http://34.69.214.55:3000/home?googleComplete=true");
  }
); */

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://34.69.214.55:3000/home?error=google",
    session: false,
  }),
  (req, res) => {
    const user = req.user as any;
    const info = req.authInfo as {
      message?: string;
      token?: string;
      email?: string;
    };

    console.log("🔁 CALLBACK GOOGLE:");
    console.log("👤 user:", user);
    console.log("ℹ️  info:", info);

    // ✅ Caso: cuenta ya registrada previamente
    if (!user && info?.message === "alreadyExists") {
      console.log("⚠️ Usuario ya registrado manualmente. Enviando login automático.");
      return res.redirect(
        `http://34.69.214.55:3000/home?googleAutoLogin=true&token=${info.token}&email=${info.email}`
      );
    }

    // ✅ Caso: cuenta nueva, requiere completar perfil
    const token = generateToken({
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo,
    });

    console.log("🧩 Usuario nuevo, redirigiendo a completar perfil");
    return res.redirect(
      `http://34.69.214.55:3000/home?googleComplete=true&token=${token}&email=${user.email}`
    );
  }
);


router.get("/auth/success", (req, res) => {
  res.send("Inicio de sesión con Google exitoso!");
});

router.patch('/update-profile', isAuthenticated, updateGoogleProfile);

router.get("/auth/failure", (req, res) => {
  res.send("Fallo al iniciar sesión con Google.");
});

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", isAuthenticated, me);
router.get("/user-profile/:id_usuario", getUserProfile);

//foto de perfil actualizar/eliminar
router.post(
  "/upload-profile-photo",
  authMiddleware,
  upload.single("foto_perfil"),
  uploadProfilePhoto
);
router.delete("/delete-profile-photo", authMiddleware, deleteProfilePhoto);

router.post("/check-phone", checkPhoneExists);
export default router;