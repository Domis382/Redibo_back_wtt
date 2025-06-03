import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import passport from "passport";

import path from "path";
import { PrismaClient } from "@prisma/client";

// Rutas
import passwordRoutes from "../src/routes/password.routes";
import authRoutes from "../src/routes/auth.routes";
import authRegistroHostRoutes from "../src/routes/registroHost.routes";
import authRegistroDriverRoutes from "./routes/registroDriver.routes";
import usuarioRoutes from "./routes/usuario.routes";
import visualizarDriverRoutes from "./routes/visualizarDriver.routes";
import listaDriversRoutes from './routes/listaDrivers.routes';

// Google Auth
import "../src/config/googleAuth";

//verificacion en 2 pasos
import twofaRoutes from './routes/twofa.routes';


const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// ✅ Crear ubicación por defecto al iniciar el servidor
async function ensureDefaultUbicacion() {
  const existing = await prisma.ubicacion.findUnique({ where: { idUbicacion: 1 } });

  if (!existing) {
    await prisma.ubicacion.create({
      data: {
        idUbicacion: 1,
        nombre: "Ubicación por defecto",
        descripcion: "Generada automáticamente",
        latitud: -17.3935,
        longitud: -66.1570,
        esActiva: true,
      },
    });
    console.log("✅ Ubicación por defecto creada");
  } else {
    console.log("ℹ️ Ubicación por defecto ya existe");
  }
}

// ✅ CORS robusto
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header("Access-Control-Allow-Origin", "http://34.55.214.237:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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
      secure: false, // en producción: true si usas HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads'));

// Rutas
app.use("/api", authRoutes);
app.use("/api", passwordRoutes);
app.use("/api", authRegistroHostRoutes);
app.use("/api", authRegistroDriverRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", visualizarDriverRoutes);
app.use("/api", listaDriversRoutes);

//verificacion en 2 pasos
app.use('/api/', twofaRoutes);


app.get("/", (req, res) => {
  res.send("¡Hola desde la página principal!");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Inicializar servidor solo después de crear la ubicación por defecto
ensureDefaultUbicacion()
  .catch((err) => {
    console.error("❌ Error al crear ubicación por defecto:", err);
  });

export default app;


// Visualizar renters
import visualizarRentersRoutes from "./routes/visualizarRenters.routes"

app.use("/api", visualizarRentersRoutes);
