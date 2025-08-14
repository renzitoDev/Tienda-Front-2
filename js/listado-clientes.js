// js/listado-clientes.js

// Endpoint base del backend
const API_CLIENTES = 'http://localhost/backend-apiCrud/index.php?url=clientes';

// Selectores
const table = document.getElementById('table-clientes');
const tbody = table?.querySelector('tbody');
const searchInput = document.getElementById('search-input');

// Modal Ver (ya existe en tu HTML)
const modalView = {
  nombreCompleto: document.getElementById('modal-nombre-completo'),
  email: document.getElementById('modal-email'),
  celular: document.getElementById('modal-celular'),
  direccion: document.getElementById('modal-direccion'),
  direccion2: document.getElementById('modal-direccion2'),
  descripcion: document.getElementById('modal-descripcion'),
};

// Modal Editar (nuevo)
const editForm = document.getElementById('form-editar-cliente');
const editFields = {
  id: document.getElementById('edit-id-cliente'),
  nombre: document.getElementById('edit-nombre'),
  apellido: document.getElementById('edit-apellido'),
  email: document.getElementById('edit-email'),
  celular: document.getElementById('edit-celular'),
  direccion: document.getElementById('edit-direccion'),
  direccion2: document.getElementById('edit-direccion2'),
  descripcion: document.getElementById('edit-descripcion'),
};
const btnGuardarEdicion = document.getElementById('btn-guardar-edicion');

// Estado
let clientes = [];
let filtro = '';

// Helpers
const escapeHTML = (str) =>
  String(str ?? '').replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));

function matchesFilter(c, q) {
  if (!q) return true;
  const hay = (v) => String(v ?? '').toLowerCase().includes(q);
  return (
    hay(c.id_cliente) || hay(c.nombre) || hay(c.apellido) || hay(c.email) ||
    hay(c.celular) || hay(c.direccion) || hay(c.direccion2) || hay(c.descripcion)
  );
}

async function api(method = 'GET', body = null, query = '') {
  const url = API_CLIENTES + (query ? `&${query}` : '');
  const opts = { method, headers: { 'Accept': 'application/json' } };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`);
  return data;
}

async function getById(id) {
  return api('GET', null, `id=${encodeURIComponent(id)}`);
}

function renderTabla() {
  if (!tbody) return;
  const q = filtro.toLowerCase();
  const filas = clientes
    .filter((c) => matchesFilter(c, q))
    .map((c, i) => `
      <tr data-id="${escapeHTML(c.id_cliente)}">
        <td>${i + 1}</td>
        <td>${escapeHTML(c.nombre)}</td>
        <td>${escapeHTML(c.apellido)}</td>
        <td>${escapeHTML(c.email)}</td>
        <td>${escapeHTML(c.celular)}</td>
        <td>${escapeHTML(c.direccion)}</td>
        <td class="d-flex gap-1">
          <button class="btn btn-sm btn-warning btn-edit" data-id="${escapeHTML(c.id_cliente)}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${escapeHTML(c.id_cliente)}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-info btn-view" data-id="${escapeHTML(c.id_cliente)}" title="Ver">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `)
    .join('');
  tbody.innerHTML = filas || `<tr><td colspan="7" class="text-center text-muted">Sin resultados</td></tr>`;
}

async function cargarClientes() {
  try {
    const data = await api('GET');
    clientes = Array.isArray(data) ? data : [];
    renderTabla();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al cargar clientes');
  }
}

searchInput?.addEventListener('input', () => {
  filtro = searchInput.value || '';
  renderTabla();
});

tbody?.addEventListener('click', async (e) => {
  const btnView = e.target.closest('.btn-view');
  const btnEdit = e.target.closest('.btn-edit');
  const btnDelete = e.target.closest('.btn-delete');

  if (btnView) {
    const id = btnView.dataset.id;
    await onView(id);
    return;
  }
  if (btnEdit) {
    const id = btnEdit.dataset.id;
    await onEdit(id);
    return;
  }
  if (btnDelete) {
    const id = btnDelete.dataset.id;
    await onDelete(id);
    return;
  }
});

// Ver cliente en modal existente
async function onView(id) {
  try {
    const c = await getById(id);
    modalView.nombreCompleto.textContent = `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim();
    modalView.email.textContent = c.email ?? '';
    modalView.celular.textContent = c.celular ?? '';
    modalView.direccion.textContent = c.direccion ?? '';
    modalView.direccion2.textContent = c.direccion2 || 'No especificada';
    modalView.descripcion.textContent = c.descripcion || 'Sin descripción';
    window.clienteActual = c; // opcional
    if (window.$) $('#verClienteModal').modal('show');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al obtener el cliente');
  }
}

// Abrir modal de edición con datos precargados
async function onEdit(id) {
  try {
    const c = await getById(id);
    editFields.id.value = c.id_cliente;
    editFields.nombre.value = c.nombre ?? '';
    editFields.apellido.value = c.apellido ?? '';
    editFields.email.value = c.email ?? '';
    editFields.celular.value = c.celular ?? '';
    editFields.direccion.value = c.direccion ?? '';
    editFields.direccion2.value = c.direccion2 ?? '';
    editFields.descripcion.value = c.descripcion ?? '';
    if (window.$) $('#editarClienteModal').modal('show');
  } catch (err) {
    console.error(err);
    alert(err.message || 'No se pudo cargar el cliente para edición');
  }
}

// Guardar cambios (PUT)
editForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editFields.id.value;
  const payload = {
    id: Number(id),
    nombre: editFields.nombre.value.trim(),
    apellido: editFields.apellido.value.trim(),
    email: editFields.email.value.trim(),
    celular: editFields.celular.value.trim(),
    direccion: editFields.direccion.value.trim(),
    direccion2: editFields.direccion2.value.trim(),
    descripcion: editFields.descripcion.value.trim(),
  };

  // Validaciones mínimas
  const errors = [];
  if (!payload.nombre) errors.push('El nombre es obligatorio.');
  if (!payload.apellido) errors.push('El apellido es obligatorio.');
  if (!payload.email) errors.push('El email es obligatorio.');
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push('El email no es válido.');
  if (!payload.celular) errors.push('El celular es obligatorio.');
  if (!payload.direccion) errors.push('La dirección principal es obligatoria.');
  if (errors.length) { alert(errors.join('\n')); return; }

  btnGuardarEdicion.disabled = true;
  const originalText = btnGuardarEdicion.innerText;
  btnGuardarEdicion.innerText = 'Guardando...';

  try {
    await api('PUT', payload);
    // Actualizar en memoria y re-renderizar sin recargar toda la lista del servidor
    clientes = clientes.map((c) => String(c.id_cliente) === String(id) ? {
      ...c,
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      celular: payload.celular,
      direccion: payload.direccion,
      direccion2: payload.direccion2,
      descripcion: payload.descripcion,
    } : c);
    renderTabla();
    if (window.$) $('#editarClienteModal').modal('hide');
    alert('Cliente actualizado con éxito');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al actualizar cliente');
  } finally {
    btnGuardarEdicion.disabled = false;
    btnGuardarEdicion.innerText = originalText;
  }
});

// Eliminar cliente
async function onDelete(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  try {
    await api('DELETE', { id: Number(id) });
    clientes = clientes.filter((c) => String(c.id_cliente) !== String(id));
    renderTabla();
    alert('Cliente eliminado con éxito');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al eliminar cliente');
  }
}

window.filtrarClientes = function(q) {
  if (typeof renderTabla === 'function') {
    filtro = q || '';
    renderTabla();
  }
};


// Inicializar
document.addEventListener('DOMContentLoaded', cargarClientes);
