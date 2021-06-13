import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth.js';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decode = await promisify(jwt.verify)(token, authConfig.secret);

    if (decode.id) {
      req.idAdmin = decode.id;
      req.emailAdmin = decode.email;
    } else {
      req.referenceUser = decode.reference;
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};
