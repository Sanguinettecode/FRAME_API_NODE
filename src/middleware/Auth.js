import JWT from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../config/auth';

export default async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeaders.split(' ');
  try {
    const decoded = await promisify(JWT.verify)(token, authConfig.SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
