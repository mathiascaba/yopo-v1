const { leer, guardar } = require('./github-store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { codigo, dispositivo } = req.body;
  if (!codigo || !dispositivo) return res.status(400).json({ error: 'Faltan codigo o dispositivo' });

  try {
    const { contenido, sha } = await leer();
    const codeData = contenido.codes[codigo];

    if (!codeData) {
      if (!contenido.intentos_fallidos) contenido.intentos_fallidos = [];
      contenido.intentos_fallidos.push({
        codigo, dispositivo, fecha: new Date().toISOString(), motivo: 'codigo_invalido'
      });
      await guardar(contenido, sha);
      return res.status(400).json({ error: 'Codigo invalido' });
    }

    if (codeData.blocked) return res.status(400).json({ error: 'Codigo bloqueado' });

    if (codeData.used) {
      const mismoDispositivo = codeData.dispositivo === dispositivo;
      if (!contenido.intentos_fallidos) contenido.intentos_fallidos = [];
      contenido.intentos_fallidos.push({
        codigo, dispositivo, fecha: new Date().toISOString(), motivo: mismoDispositivo ? 'reintento_mismo' : 'compartido_a_otro'
      });
      if (!mismoDispositivo) {
        codeData.blocked = true;
      }
      await guardar(contenido, sha);
      if (!mismoDispositivo) {
        return res.status(400).json({ error: 'Codigo bloqueado' });
      }
      return res.status(400).json({ error: 'Codigo ya usado' });
    }

    codeData.used = true;
    codeData.dispositivo = dispositivo;
    codeData.fecha_uso = new Date().toISOString();

    if (!contenido.dispositivos) contenido.dispositivos = [];
    contenido.dispositivos.push({ id: dispositivo, codigo, fecha: new Date().toISOString() });

    await guardar(contenido, sha);
    return res.json({ success: true, message: 'Dispositivo activado correctamente' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};