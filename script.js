let manuales = {};
let favoritos = [];

async function cargarDatos() {
  const res = await fetch('manuales.json'); // ajusta la ruta si está en otra carpeta
  manuales = await res.json();

  mostrarInicio();
}

function mostrarInicio() {
  document.getElementById('modulos-principales').innerHTML = '';
  document.getElementById('submodulos').innerHTML = '';

  const contenedor = document.getElementById('modulos-principales');

  Object.keys(manuales).forEach(modulo => {
    const div = document.createElement('div');
    div.className = 'modulo-card';
    div.textContent = modulo;
    div.onclick = () => cargarModulo(modulo);
    contenedor.appendChild(div);
  });
}

function cargarModulo(modulo) {
  const submodulos = manuales[modulo];
  document.getElementById('modulos-principales').innerHTML = '';
  const contenedor = document.getElementById('submodulos');
  contenedor.innerHTML = `<h2>${modulo}</h2>`;

  Object.keys(submodulos).forEach(sub => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${sub}</h3>`;

    submodulos[sub].forEach(pdf => {
      const btn = document.createElement('button');
      btn.textContent = pdf;
      // La ruta para abrir el pdf debe corresponder a la estructura de carpetas
      btn.onclick = () => abrirVisor(`manuales/${modulo}/${sub}/${encodeURIComponent(pdf)}`);
      div.appendChild(btn);
    });

    contenedor.appendChild(div);
  });
}

function abrirVisor(url) {
  const visor = document.getElementById('visorPDF');
  const frame = document.getElementById('pdfFrame');
  frame.src = url;
  visor.classList.remove('oculto');
}

function cerrarVisor() {
  const visor = document.getElementById('visorPDF');
  visor.classList.add('oculto');
  document.getElementById('pdfFrame').src = '';
}

cargarDatos();
