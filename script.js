let manuales = {};
let favoritos = [];
let visorPDFactual = {
  modulo: null,
  submodulo: null,
  archivo: null
};

// Cargar manuales y favoritos al inicio
async function cargarDatos() {
  const res = await fetch('/api/manuales');
  manuales = await res.json();

  const favRes = await fetch('/api/favoritos');
  favoritos = await favRes.json();

  mostrarInicio();
}

// Mostrar botones de módulos principales
function mostrarInicio() {
  document.getElementById('buscador').value = '';
  document.getElementById('submodulos').style.display = 'none';
  document.getElementById('submodulos').innerHTML = '';
  document.getElementById('modulos-principales').style.display = 'grid';

  const contenedor = document.getElementById('modulos-principales');
  contenedor.innerHTML = '';

  const modulos = ['Surtidores', 'Veeder Root', 'Vox Forecourt', 'Herramientas'];
  const imagenes = {
    'Surtidores': 'Prime Encore 500s.png',
    'Veeder Root': 'veederoot450tls.png',
    'Vox Forecourt': 'voxforecourt.png',
    'Herramientas': 'herramientas.png'
  };

  modulos.forEach(modulo => {
    const div = document.createElement('div');
    div.className = 'modulo-card';
    div.onclick = () => {
      if (modulo === 'Herramientas') {
        alert('🚧 Herramientas en desarrollo');
      } else {
        cargarModulo(modulo);
      }
    };

    div.innerHTML = `
      <img src="assets/${imagenes[modulo]}" alt="${modulo}">
      <span>${modulo}</span>
    `;
    contenedor.appendChild(div);
  });

  cerrarVisor();
}

// Cargar los submódulos y sus PDFs
function cargarModulo(nombreModulo) {
  const submodulos = manuales[nombreModulo];
  const contenedor = document.getElementById('submodulos');
  document.getElementById('modulos-principales').style.display = 'none';
  contenedor.style.display = 'block';
  contenedor.innerHTML = '';

  const titulo = document.createElement('h2');
  titulo.textContent = nombreModulo;
  contenedor.appendChild(titulo);

  if (!submodulos) {
    const p = document.createElement('p');
    p.textContent = 'No se encontraron submódulos.';
    contenedor.appendChild(p);
    return;
  }

  Object.keys(submodulos).forEach(sub => {
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = sub;
    div.appendChild(h3);

    submodulos[sub].forEach(pdf => {
      const btn = document.createElement('button');
      btn.textContent = pdf;

      btn.addEventListener('click', () => abrirVisor(`/manuales/${nombreModulo}/${sub}/${pdf}`));

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        agregarAFavoritos(nombreModulo, sub, pdf);
      });

      div.appendChild(btn);
    });

    contenedor.appendChild(div);
  });

  cerrarVisor();
}

// Abrir visor PDF
function abrirVisor(url) {
  const visor = document.getElementById('visorPDF');
  const frame = document.getElementById('pdfFrame');
  frame.src = url;
  visor.classList.remove('oculto');

  // Guardar info para añadir a favoritos
  const partes = url.split('/');
  visorPDFactual = {
    modulo: decodeURIComponent(partes[2]),
    submodulo: decodeURIComponent(partes[3]),
    archivo: decodeURIComponent(partes[4])
  };
}

// Cerrar visor PDF
function cerrarVisor() {
  const visor = document.getElementById('visorPDF');
  visor.classList.add('oculto');
  document.getElementById('pdfFrame').src = '';
}

// Agregar PDF a favoritos
function agregarAFavoritos(modulo, submodulo, archivo) {
  const ruta = `/manuales/${modulo}/${submodulo}/${archivo}`;
  if (!favoritos.find(f => f.ruta === ruta)) {
    favoritos.push({ modulo, submodulo, archivo, ruta });
    guardarFavoritos();
    alert('📌 Agregado a favoritos');
  } else {
    alert('⚠️ Este archivo ya está en favoritos');
  }
}

// Guardar favoritos en el servidor
function guardarFavoritos() {
  fetch('/api/favoritos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(favoritos)
  });
}

// Mostrar todos los favoritos
function mostrarFavoritos() {
  const contenedor = document.getElementById('submodulos');
  document.getElementById('modulos-principales').style.display = 'none';
  contenedor.style.display = 'block';
  contenedor.innerHTML = '<h2>⭐ Favoritos</h2>';
  const div = document.createElement('div');

  if (favoritos.length === 0) {
    div.innerHTML = '<p>No hay favoritos guardados.</p>';
  } else {
    favoritos.forEach((f, index) => {
      const container = document.createElement('div');
      container.className = 'favorito-item';

      const btn = document.createElement('button');
      btn.textContent = `${f.modulo} / ${f.submodulo} / ${f.archivo}`;
      btn.onclick = () => abrirVisor(f.ruta);

      const descargarBtn = document.createElement('a');
      descargarBtn.href = f.ruta;
      descargarBtn.download = f.archivo;
      descargarBtn.className = 'btn-descargar';
      descargarBtn.title = 'Descargar PDF';

      const icono = document.createElement('img');
      icono.src = 'assets/download.png'; // Debe estar en /assets
      icono.alt = 'Descargar';
      icono.width = 20;
      icono.height = 20;

      descargarBtn.appendChild(icono);

      const eliminarBtn = document.createElement('button');
      eliminarBtn.className = 'btn-eliminar';
      eliminarBtn.innerHTML = '🗑️';
      eliminarBtn.title = 'Eliminar de favoritos';
      eliminarBtn.onclick = () => eliminarFavorito(index);

      container.appendChild(btn);
      container.appendChild(descargarBtn);
      container.appendChild(eliminarBtn);

      div.appendChild(container);
    });
  }

  contenedor.appendChild(div);
  cerrarVisor();
}

function eliminarFavorito(index) {
  if (confirm('¿Eliminar este favorito?')) {
    favoritos.splice(index, 1);
    guardarFavoritos();
    mostrarFavoritos();
  }
}

// Buscar PDFs por nombre
document.getElementById('buscador').addEventListener('input', e => {
  const texto = e.target.value.toLowerCase();
  if (!texto) {
    mostrarInicio();
    return;
  }

  const resultados = {};

  Object.entries(manuales).forEach(([modulo, submodulos]) => {
    Object.entries(submodulos).forEach(([sub, pdfs]) => {
      const filtrados = pdfs.filter(p => p.toLowerCase().includes(texto));
      if (filtrados.length) {
        if (!resultados[modulo]) resultados[modulo] = {};
        resultados[modulo][sub] = filtrados;
      }
    });
  });

  document.getElementById('modulos-principales').style.display = 'none';
  mostrarResultadosBusqueda(resultados);
});

// Mostrar resultados del buscador
function mostrarResultadosBusqueda(resultados) {
  const contenedor = document.getElementById('submodulos');
  contenedor.style.display = 'block';
  contenedor.innerHTML = `<h2>🔍 Resultados</h2>`;

  Object.entries(resultados).forEach(([modulo, submodulos]) => {
    Object.entries(submodulos).forEach(([sub, pdfs]) => {
      const div = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.textContent = `${modulo} → ${sub}`;
      div.appendChild(h3);

      pdfs.forEach(pdf => {
        const btn = document.createElement('button');
        btn.textContent = pdf;

        btn.addEventListener('click', () => abrirVisor(`/manuales/${modulo}/${sub}/${pdf}`));

        btn.addEventListener('contextmenu', e => {
          e.preventDefault();
          agregarAFavoritos(modulo, sub, pdf);
        });

        div.appendChild(btn);
      });

      contenedor.appendChild(div);
    });
  });

  cerrarVisor();
}

function agregarFavoritoDesdeVisor() {
  const { modulo, submodulo, archivo } = visorPDFactual;
  if (!modulo || !submodulo || !archivo) return;

  agregarAFavoritos(modulo, submodulo, archivo);
}

// Al cargar la página
cargarDatos();
