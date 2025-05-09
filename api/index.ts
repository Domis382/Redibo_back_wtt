import app from '../src/app';
import { NowRequest, NowResponse } from '@vercel/node';

export default function handler(req: NowRequest, res: NowResponse) {
  return app(req, res); // Express maneja la petición directamente
}
