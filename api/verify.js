const { leer } = require('./github-store');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { dispositivo } = req.query;
  if (!dispositivo) return res.status(400).json({ error: 'Falta parametro dispositivo' });

  try {
    const { contenido } = await leer();
    const dispositivoData = contenido.dispositivos?.find(d => d.id === dispositivo) || null;

    return res.json({
      activado: !!dispositivoData,
      data: dispositivoData
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};