// js/listado-pro.js
const API_PRODUCTOS = 'http://localhost/backend-apiCrud/index.php?url=productos';

const tbody = document.querySelector('#table-pro tbody');
const searchInput = document.querySelector('#search-input');

let productos = [];
let filtro = '';

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function matchesFilter(p, q) {
  if (!q) return true;
  const has = (v) => String(v ?? '').toLowerCase().includes(q);
  return has(p.nombre) || has(p.descripcion) || has(p.precio) || has(p.stock);
}

async function api(method = 'GET', body = null, query = '') {
  const url = API_PRODUCTOS + (query ? `&${query}` : '');
  const opts = { method, headers: { Accept: 'application/json' } };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`);
  return data;
}

function renderTabla() {
  const q = filtro.toLowerCase();
  const filas = productos
    .filter((p) => matchesFilter(p, q))
    .map((p, i) => `
      <tr data-id="${escapeHTML(p.id)}">
        <td>${i + 1}</td>
        <td>${escapeHTML(p.nombre)}</td>
        <td>${escapeHTML(p.descripcion)}</td>
        <td>${escapeHTML(p.precio)}</td>
        <td>${escapeHTML(p.stock)}</td>
        <td>${p.imagen ? `<img src="${escapeHTML(p.imagen)}" width="80" alt="img">` : ''}</td>
        <td class="d-flex gap-1">
          <button class="btn btn-sm btn-warning btn-edit" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  tbody.innerHTML = filas || `<tr><td colspan="7" class="text-center text-muted">Sin resultados</td></tr>`;
}

async function cargarProductos() {
  try {
    const data = await api('GET');
    productos = Array.isArray(data) ? data : [];
    renderTabla();
  } catch (e) {
    console.error(e);
    alert(e.message || 'Error al cargar productos');
  }
}

searchInput?.addEventListener('input', () => {
  filtro = searchInput.value || '';
  renderTabla();
});

tbody?.addEventListener('click', async (e) => {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.getAttribute('data-id');

  const btnEdit = e.target.closest('.btn-edit');
  const btnDelete = e.target.closest('.btn-delete');

  if (btnEdit) {
    // Redirigir a crear-pro en modo edición
    window.location.href = `crear-pro.html?id=${encodeURIComponent(id)}`;
    return;
  }
  if (btnDelete) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api('DELETE', { id: Number(id) });
      productos = productos.filter((p) => String(p.id) !== String(id));
      renderTabla();
      alert('Producto eliminado con éxito');
    } catch (e2) {
      console.error(e2);
      alert(e2.message || 'Error al eliminar producto');
    }
  }
});

// Permitir filtro desde el topbar cuando no hay input local
window.filtrarProductos = function(q) {
  // Reutilizamos la lógica existente: setear filtro y re-render
  // Usa las mismas variables que ya declaraste en el archivo
  // Si el archivo actual define 'filtro' y 'renderTabla', esto funcionará:
  if (typeof renderTabla === 'function') {
    filtro = q || '';
    renderTabla();
  }
};

document.addEventListener('DOMContentLoaded', cargarProductos);


