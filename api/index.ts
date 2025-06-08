/* import app from "../src/app";
import ensureDefaultUbicacion from "../src/app";
import { NowRequest, NowResponse } from '@vercel/node';

// Asegura la ejecución de setup antes de la primera request
let initialized = false;

export default async function handler(req: NowRequest, res: NowResponse) {
  if (!initialized) {
    await ensureDefaultUbicacion(req, res);
    initialized = true;
  }

  return app(req, res); // Vercel maneja internamente app como handler
}
 */