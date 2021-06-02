import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import Admin from '../schemas/Admin.js';
import authConfig from '../../config/auth.js';

class SessionController {
  async sessionAdmin(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Falha na validação!' });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({
      email,
    });

    if (!admin) {
      res.status(401).json({ error: 'Email não cadastrado!' });
    }

    const checkPassword = await bcrypt.compare(password, admin.password_hash);

    if (!checkPassword) {
      res.status(401).json({ error: 'Senha incorreta!' });
    }

    const { id, nome } = admin;

    return res.json({
      id,
      nome,
      email,
      token: jwt.sign({ id, email }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }

  async sessionUser(req, res) {
    const schema = Yup.object().shape({
      reference: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Falha na validação!' });
    }

    const { reference } = req.body;

    const dateNow = new Date();
    const hours = 3;
    const ExpiresIn = new Date(
      new Date(dateNow).setHours(dateNow.getHours() + hours)
    );

    return res.json({
      reference,
      token: jwt.sign({ reference }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
      expiresIn: ExpiresIn, // data agora + 3 horas para expiração
    });
  }
}

export default new SessionController();
