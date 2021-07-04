import * as Yup from 'yup';
import bcrypt from 'bcryptjs';

import Admin from '../schemas/Admin.js';

import mongoose from 'mongoose';

class AdminController {
  async insert(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required().max(100),
      email: Yup.string().required().max(100).email(),
      password: Yup.string().required().max(8).min(6),
    });

    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({
      email,
    });

    if (admin) {
      return res.status(400).json({ error: 'Este email já está cadastrado!' });
    }

    req.body.password_hash = await bcrypt.hash(password, 8);

    const adminData = await Admin.create(req.body);

    return res.json(adminData);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const adminData = await Admin.paginate(
      {},
      {
        page,
        limit: 5,
        sort: { name: 'asc' },
        select: 'nome email',
      }
    );

    return res.json(adminData);
  }

  async details(req, res) {
    const adminData = await Admin.findById(req.params.id).select(
      'nome email status'
    );

    if (!adminData) {
      return res.status(400).json({ error: 'ID não existe!' });
    }

    return res.json(adminData);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().max(100),
      email: Yup.string().max(100).email(),
      oldPassword: Yup.string().min(4).max(8),
      password: Yup.string()
        .max(8)
        .min(4)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string()
        .max(8)
        .min(4)
        .when('password', (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const { email, password, oldPassword } = req.body;

    const admin = await Admin.findById(req.idAdmin);

    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({
        email,
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado!' });
      }
    }

    const checkPassword = await bcrypt.compare(
      oldPassword,
      admin.password_hash
    );

    if (!checkPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta!' });
    }

    req.body.password_hash = await bcrypt.hash(password, 8);

    const adminData = await Admin.findByIdAndUpdate(req.idAdmin, req.body, {
      new: true,
    });

    return res.json(adminData);
  }

  async updateStatus(req, res) {
    const adminData = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select('nome email active');

    if (!adminData) {
      return res.status(400).json({ error: 'ID nã oencontrado!' });
    }

    return res.json(adminData);
  }
}

export default new AdminController();
