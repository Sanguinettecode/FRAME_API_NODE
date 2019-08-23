import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fail' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      res.status(400).json({ error: 'User email already exists' });
    }
    const { name, email, id, provider } = await User.create(req.body);
    res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldpassword: Yup.string()
        .required()
        .min(6),
      password: Yup.string()
        .min(6)
        .when('oldpassword', (oldpassword, field) => {
          return oldpassword ? field.required() : field;
        }),
      confirmpassword: Yup.string().when('password', (password, field) => {
        return password ? field.required().oneOf([Yup.ref('password')]) : field;
      }),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fail' });
    }
    const { email, oldpassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });
      if (userExists) {
        res.status(400).json({ error: 'User email already exists' });
      }
    }

    if (oldpassword && !(await user.checkPass(oldpassword))) {
      res.status(401).json({ error: 'Password does not match' });
    }
    const { name, id, provider } = await user.update(req.body);
    res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
