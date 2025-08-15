// js/topbar-search.js
// Opción 1: Filtra vista actual y muestra dropdown con resultados locales.
// Preparado para Opción 2: búsqueda global (completa fetchGlobalResults() más adelante).

const TB = {
  input: null,
  dropdown: null,
  itemsFlat: [],   // lista lineal para navegación con teclado
  activeIndex: -1,
  view: 'otra',
};

// No usamos $ para no interferir con jQuery/Bootstrap
const $$ = (sel, ctx = document) => ctx.querySelector(sel);

function getView() {
  const path = (location.pathname || '').toLowerCase();
  if (path.includes('listado-pro.html')) return 'productos';
  if (path.includes('listado-clientes.html')) return 'clientes';
  if (path.includes('listado-pedidos.html')) return 'pedidos';
  return 'otra';
}

function ensureRefs() {
  TB.input = document.querySelector('.navbar-search input.form-control.bg-light');
  TB.dropdown = $$('#topbar-search-dropdown');
  TB.view = getView();
}

function showDropdown() { if (TB.dropdown) TB.dropdown.classList.remove('d-none'); }
function hideDropdown() { if (TB.dropdown) TB.dropdown.classList.add('d-none'); TB.activeIndex = -1; }
function clearDropdown() {
  if (TB.dropdown) TB.dropdown.innerHTML = '';
  TB.itemsFlat = [];
  TB.activeIndex = -1;
}

// Escape seguro para construir RegExp con la query del usuario
function escapeRegExp(str) {
  return String(str ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, q) {
  if (!q) return String(text ?? '');
  try {
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    return String(text ?? '').replace(re, '<strong>$1</strong>');
  } catch {
    return String(text ?? '');
  }
}

function renderSection(title, items) {
  if (!items || !items.length) return '';
  const htmlItems = items.map((it) => {
    return `
      <div class="item" data-goto="${encodeURIComponent(it.goto)}" data-index>
        ${it.thumb ? `<img class="thumb" src="${it.thumb}" alt="">` : `<i class="fas fa-search text-muted"></i>`}
        <div class="meta">
          <div class="title">${it.title}</div>
          ${it.sub ? `<div class="sub">${it.sub}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  return `
    <div class="section">
      <div class="section-title">${title}</div>
      ${htmlItems}
    </div>
  `;
}

function collectLocalResults(q) {
  const query = (q || '').trim().toLowerCase();
  if (!query) return { productos: [], clientes: [], pedidos: [] };

  // Datos locales por vista (debes exponerlos en cada módulo si quieres resultados aquí)
  let productosData = [];
  if (TB.view === 'productos') {
    productosData = Array.isArray(window.productos) ? window.productos : [];
  }

  let clientesData = [];
  if (TB.view === 'clientes') {
    clientesData = Array.isArray(window.clientes) ? window.clientes : [];
  }

  let pedidosData = [];
  if (TB.view === 'pedidos') {
    pedidosData = Array.isArray(window.pedidos) ? window.pedidos : [];
  }

  const filtra = (obj, campos) => campos.some(c => String(obj[c] ?? '').toLowerCase().includes(query));

  const proRes = productosData
    .slice(0, 200)
    .filter(p => filtra(p, ['nombre', 'descripcion', 'precio', 'stock']))
    .slice(0, 8)
    .map(p => ({
      goto: `crear-pro.html?id=${p.id}`,
      title: highlight(`${p.nombre}`, query),
      sub: highlight(`$${p.precio} · Stock: ${p.stock}`, query),
      thumb: p.imagen || '',
    }));

  const cliRes = clientesData
    .slice(0, 200)
    .filter(c => filtra(c, ['nombre', 'apellido', 'email', 'celular', 'direccion', 'direccion2']))
    .slice(0, 8)
    .map(c => ({
      goto: `listado-clientes.html#ver-${c.id_cliente}`,
      title: highlight(`${c.nombre} ${c.apellido}`, query),
      sub: highlight(`${c.email} · ${c.celular}`, query),
      thumb: '',
    }));

  const pedRes = pedidosData
    .slice(0, 200)
    .filter(ped => filtra(ped, ['id_pedido', 'cliente', 'estado', 'fecha']))
    .slice(0, 8)
    .map(ped => ({
      goto: `listado-pedidos.html#ped-${ped.id_pedido}`,
      title: highlight(`Pedido #${ped.id_pedido}`, query),
      sub: highlight(`${ped.cliente} · ${ped.fecha}`, query),
      thumb: '',
    }));

  // Opción 1: muestra sólo sección de la vista actual
  if (TB.view === 'productos') return { productos: proRes, clientes: [], pedidos: [] };
  if (TB.view === 'clientes') return { productos: [], clientes: cliRes, pedidos: [] };
  if (TB.view === 'pedidos')  return { productos: [], clientes: [], pedidos: pedRes };
  return { productos: [], clientes: [], pedidos: [] };
}

// Preparado para Opción 2 (futuro)
async function fetchGlobalResults(q) {
  // Cuando implementes el backend /search, reemplaza este mock:
  // const res = await fetch(`http://localhost/backend-apiCrud/index.php?url=search&q=${encodeURIComponent(q)}&scope=all`);
  // const data = await res.json();
  // return data; // { productos: [], clientes: [], pedidos: [], usuarios: [] }
  return collectLocalResults(q); // por ahora, usa locales
}

function renderDropdown(data) {
  clearDropdown();
  if (!TB.dropdown) return;

  const sections = [];
  if (data.productos && data.productos.length) sections.push(renderSection('Productos', data.productos));
  if (data.clientes && data.clientes.length)   sections.push(renderSection('Clientes', data.clientes));
  if (data.pedidos && data.pedidos.length)     sections.push(renderSection('Pedidos', data.pedidos));

  if (!sections.length) {
    TB.dropdown.innerHTML = `<div class="section"><div class="item"><div class="meta"><div class="title text-muted">Sin resultados</div></div></div></div>`;
    showDropdown();
    return;
  }

  TB.dropdown.innerHTML = sections.join('');

  // Recolectar items para navegación por teclado
  TB.itemsFlat = Array.from(TB.dropdown.querySelectorAll('.item'));
  TB.itemsFlat.forEach((el, idx) => {
    el.dataset.index = String(idx);
    el.addEventListener('click', () => gotoItem(idx));
    el.addEventListener('mousemove', () => setActive(idx));
  });

  setActive(0);
  showDropdown();
}

function setActive(idx) {
  TB.activeIndex = idx;
  TB.itemsFlat.forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

function gotoItem(idx) {
  const el = TB.itemsFlat[idx];
  if (!el) return;
  const url = decodeURIComponent(el.dataset.goto || '');
  if (url) window.location.href = url;
}

function handleKey(e) {
  if (!TB.dropdown || TB.dropdown.classList.contains('d-none')) return;
  const max = TB.itemsFlat.length;
  if (!max) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActive((TB.activeIndex + 1) % max);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActive((TB.activeIndex - 1 + max) % max);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    gotoItem(TB.activeIndex);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    hideDropdown();
  }
}

// Reusa filtro local de la vista
function syncWithLocalSearch(value) {
  const localInput = $$('#search-input');
  if (localInput) {
    if (localInput.value !== value) localInput.value = value;
    localInput.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  // Fallback a funciones de filtro expuestas
  const q = String(value || '').toLowerCase();
  if (TB.view === 'productos' && typeof window.filtrarProductos === 'function') { window.filtrarProductos(q); return true; }
  if (TB.view === 'clientes'  && typeof window.filtrarClientes  === 'function') { window.filtrarClientes(q);  return true; }
  if (TB.view === 'pedidos'   && typeof window.filtrarPedidos   === 'function') { window.filtrarPedidos(q);   return true; }
  return false;
}

let debounceTimer;
function onTopbarInput() {
  const value = TB.input.value || '';
  syncWithLocalSearch(value);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const data = await fetchGlobalResults(value); // ahora usa locales
    renderDropdown(data);
  }, 250);
}

function initTopbarSearch() {
  ensureRefs();
  if (!TB.input || !TB.dropdown) return;

  TB.input.addEventListener('input', onTopbarInput);
  TB.input.addEventListener('focus', () => {
    if (TB.input.value) onTopbarInput();
  });
  TB.input.addEventListener('keydown', handleKey);

  document.addEventListener('click', (e) => {
    if (TB.dropdown && !TB.dropdown.contains(e.target) && e.target !== TB.input) {
      hideDropdown();
    }
  });

  window.addEventListener('resize', hideDropdown);
  window.addEventListener('scroll', hideDropdown, true);
}

document.addEventListener('DOMContentLoaded', initTopbarSearch);
