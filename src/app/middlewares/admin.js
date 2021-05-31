import Admin from '../schemas/Admin';

export default async (req, res, next) => {
  const isAdmin = await Admin.findById(req.idAdmin).and({
    status: true,
  });

  if (!isAdmin) {
    return res
      .status(401)
      .json({ error: 'Apenas administradores tem acesso a essa requisição!' });
  }

  return next();
};
