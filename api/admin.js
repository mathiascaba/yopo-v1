const { leer, guardar } = require('./github-store');

const ADMIN_PASSWORD = '72586048';

function generarCodigo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let c = '';
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

module.exports = async (req, res) => {
  const pass = req.headers['x-admin-pass'] || req.body?.password;
  if (pass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Contrasena incorrecta' });

  try {
    const { contenido, sha } = await leer();
    const method = req.method;

    if (method === 'POST' && req.body?.action === 'generar') {
      const cantidad = Math.min(req.body.cantidad || 1, 50);
      const generados = [];
      for (let i = 0; i < cantidad; i++) {
        const c = generarCodigo();
        contenido.codes[c] = { used: false, blocked: false, creado: new Date().toISOString() };
        generados.push(c);
      }
      await guardar(contenido, sha);
      return res.json({ success: true, generados });

    } else if (method === 'GET' && req.query?.action === 'codigos') {
      const lista = Object.entries(contenido.codes || {}).map(([c, d]) => ({
        codigo: c, used: d.used, blocked: d.blocked || false, creado: d.creado,
        dispositivo: d.dispositivo || null, fecha_uso: d.fecha_uso || null
      }));
      return res.json({ codigos: lista });

    } else if (method === 'GET' && req.query?.action === 'intentos') {
      return res.json({ intentos: contenido.intentos_fallidos || [] });

    } else if (method === 'GET' && req.query?.action === 'dispositivos') {
      return res.json({ dispositivos: contenido.dispositivos || [] });

    } else if (method === 'POST' && req.body?.action === 'block') {
      const codigo = req.body.codigo;
      if (!codigo || !contenido.codes[codigo]) return res.status(400).json({ error: 'Codigo no encontrado' });
      contenido.codes[codigo].blocked = true;
      await guardar(contenido, sha);
      return res.json({ success: true, message: 'Codigo bloqueado' });

    } else if (method === 'POST' && req.body?.action === 'unblock') {
      const codigo = req.body.codigo;
      if (!codigo || !contenido.codes[codigo]) return res.status(400).json({ error: 'Codigo no encontrado' });
      contenido.codes[codigo].blocked = false;
      await guardar(contenido, sha);
      return res.json({ success: true, message: 'Codigo desbloqueado' });

    } else {
      return res.status(400).json({ error: 'Accion no valida' });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};