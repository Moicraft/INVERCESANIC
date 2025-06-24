const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// 📁 Carpetas base
app.use(express.static(__dirname));
app.use(express.json());  

// ------------------
// 📘 MANUALES
// ------------------
app.get('/manuales/*', (req, res) => {
  try {
    const requestedPath = decodeURIComponent(req.path);
    const filePath = path.join(__dirname, requestedPath);

    if (!filePath.startsWith(path.join(__dirname, 'manuales'))) {
      return res.status(403).send('Acceso denegado');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Archivo no encontrado');
    }
  } catch {
    res.status(400).send('Ruta inválida');
  }
});

app.get('/api/manuales', (req, res) => {
  const root = path.join(__dirname, 'manuales');
  const estructura = {};

  if (!fs.existsSync(root)) return res.status(404).json({ error: 'No existe /manuales' });

  fs.readdirSync(root).forEach(modulo => {
    const modPath = path.join(root, modulo);
    if (fs.statSync(modPath).isDirectory()) {
      estructura[modulo] = {};
      fs.readdirSync(modPath).forEach(sub => {
        const subPath = path.join(modPath, sub);
        if (fs.statSync(subPath).isDirectory()) {
          estructura[modulo][sub] = fs.readdirSync(subPath).filter(f => f.toLowerCase().endsWith('.pdf'));
        }
      });
    }
  });

  res.json(estructura);
});

// ------------------
// ⭐ FAVORITOS
// ------------------
const favPath = path.join(__dirname, 'data', 'favoritos.json');

app.get('/api/favoritos', (req, res) => {
  if (!fs.existsSync(favPath)) fs.writeFileSync(favPath, '[]');
  const data = fs.readFileSync(favPath, 'utf-8');
  res.json(JSON.parse(data));
});

app.post('/api/favoritos', (req, res) => {
  fs.writeFileSync(favPath, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// ------------------
// 🛠️ HERRAMIENTAS (solo listar y descargar)
// ------------------
const herramientasPath = path.join(__dirname, 'herramientas');
if (!fs.existsSync(herramientasPath)) fs.mkdirSync(herramientasPath);

app.get('/api/herramientas', (req, res) => {
  const archivos = fs.existsSync(herramientasPath)
    ? fs.readdirSync(herramientasPath)
    : [];
  res.json(archivos);
});

app.get('/herramientas/:archivo', (req, res) => {
  const archivo = path.basename(req.params.archivo);
  const filePath = path.join(herramientasPath, archivo);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.download(filePath);
  } else {
    res.status(404).send('Archivo no encontrado');
  }
});

// ------------------
// 🚀 INICIAR SERVIDOR
// ------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
