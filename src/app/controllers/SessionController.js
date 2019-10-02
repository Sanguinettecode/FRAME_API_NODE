import JWT from 'jsonwebtoken';
import * as Yup from 'yup';
import AuthConfig from '../../config/auth';
import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fail' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
    }
    if (!(await user.checkPass(password))) {
      return res.status(401).json({ error: 'User pass not match' });
    }
    const { id, name, avatar, provider } = user;
    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider,
      },
      token: JWT.sign({ id }, AuthConfig.SECRET, {
        expiresIn: AuthConfig.EXPIRES,
      }),
    });
  }
}

export default new SessionController();
