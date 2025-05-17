import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import passport from "passport";

import "../src/config/googleAuth";

import path from "path";

import authRoutes from "../src/routes/auth.routes";
import passwordRoutes from "../src/routes/password.routes";
import authRegistroHostRoutes from "../src/routes/registroHost.routes";
import authRegistroDriverRoutes from './routes/registroDriver.routes'; // Import the driver routes
import "./config/googleAuth"; // <--- importante
import usuarioRoutes from './routes/usuario.routes';
import visualizarDriverRoutes from "./routes/visualizarDriver.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS robusto – que responde incluso si hay error
app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  res.header("Access-Control-Allow-Origin", "http://34.10.219.81:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"))
);

app.use(
  session({
    secret: "mi_clave_secreta_segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads')); // Servir imágenes desde el servidor

app.use("/api", authRoutes);
app.use("/api", passwordRoutes);
app.use("/api", authRegistroHostRoutes);
app.use('/api', authRegistroDriverRoutes); // Añadir la ruta de registro de driver aquí
app.use('/api', usuarioRoutes); // Añadir la ruta de usuario aquí
app.use('/api', visualizarDriverRoutes);// Añadir la ruta de visualizar driver aquí

app.get("/", (req, res) => {
  res.send("¡Hola desde la página principal!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/puta", (req, res) => {
  res.send("que gei");
});

export default app;
