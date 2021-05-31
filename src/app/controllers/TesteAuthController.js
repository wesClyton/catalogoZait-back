export default async (req, res) => {
  if (req.idAdmin) {
    return res.json({
      message: 'Atenticado com sucesso!',
      id_admin: req.idAdmin,
      email: req.emailAdmin,
    });
  }

  if (req.referenceUser) {
    return res.json({
      message: 'Atenticado com sucesso!',
      reference: req.referenceUser,
    });
  }

  return res.status(401).json({ error: 'Autenticação falhou!' });
};
