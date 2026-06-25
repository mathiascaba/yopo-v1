const GH_TOKEN = process.env.GH_TOKEN;
const GH_REPO = process.env.GH_REPO || 'mathiascaba/yopo-v1';
const GH_PATH = process.env.GH_FILE_PATH || 'data/activacion.json';
const GH_BRANCH = process.env.GH_BRANCH || 'main';

const API_URL = `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`;

async function leerDatos() {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (res.status === 404) {
    const inicial = { codes: {}, dispositivos: [], intentos_fallidos: [] };
    await escribirDatos(inicial, null);
    return inicial;
  }
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const data = await res.json();
  return { contenido: JSON.parse(Buffer.from(data.content, 'base64').toString()), sha: data.sha };
}

async function escribirDatos(datos, sha) {
  const body = {
    message: 'Actualizar datos de activacion',
    content: Buffer.from(JSON.stringify(datos, null, 2)).toString('base64'),
    branch: GH_BRANCH
  };
  if (sha) body.sha = sha;
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub write error: ${res.status}`);
}

async function leer() {
  const r = await leerDatos();
  return r.contenido ? r : { contenido: r, sha: null };
}

async function guardar(datos, sha) {
  await escribirDatos(datos, sha);
}

module.exports = { leer, guardar };