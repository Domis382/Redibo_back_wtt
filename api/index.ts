// api/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import session from "express-session";
import passport from "passport";
import "../src/config/googleAuth";

import path from 'path';
import passwordRoutes from '../src/routes/password.routes';
import authRoutes from '../src/routes/auth.routes';
import authRegistroHostRoutes from '../src/routes/registroHost.routes';

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
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
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', authRoutes);
app.use('/api', passwordRoutes);
app.use('/api', authRegistroHostRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 👇 ¡IMPORTANTE! NO usar listen() en Vercel
export default app;
