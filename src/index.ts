import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
import session from "express-session";
import passport from "passport";
import path from 'path';

import passwordRoutes from './routes/password.routes';
import authRoutes from './routes/auth.routes';
import authRegistroHostRoutes from './routes/registroHost.routes';
import "./config/googleAuth";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS robusto – que responde incluso si hay error
app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  res.header("Access-Control-Allow-Origin", "http://34.69.214.55:3000");
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

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

app.use(
  session({
    secret: "mi_clave_secreta_segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ⚠️ en producción poner true con HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/api', authRoutes);
app.use('/api', passwordRoutes);
app.use('/api', authRegistroHostRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
