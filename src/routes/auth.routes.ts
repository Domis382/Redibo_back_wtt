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
    failureRedirect: "http://34.69.214.55:3000/home?error=cuentaExistente",
    session: false, // 👈 IMPORTANTE: no uses sesiones, usas JWT
  }),
  (req, res) => {
    const user = req.user as { id_usuario: number; email: string; nombre_completo: string };
    const token = generateToken({
      id_usuario: user.id_usuario,
      email: user.email,
      nombre_completo: user.nombre_completo,
    });

    res.redirect(`http://34.69.214.55:3000/home?googleComplete=true&token=${token}&email=${user.email}`);
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