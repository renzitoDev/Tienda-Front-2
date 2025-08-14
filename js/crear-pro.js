// js/crear-pro.js
// Modo crear/editar por querystring ?id=XX
// Backend base
const API_PRODUCTOS = 'http://localhost/backend-apiCrud/index.php?url=productos';

// Elementos
const $ = (sel) => document.querySelector(sel);
const form = $('#form-producto');
const inpId = $('#id-pro');
const inpNombre = $('#nombre-pro');
const inpPrecio = $('#precio-pro');
const inpStock = $('#stock-pro');
const inpImagenUrl = $('#imagen-url');
const txtDesc = $('#des-pro');
const imgPreview = $('#imagen-pro');
const btnCreate = document.querySelector('.btn-create');
const btnUpdate = document.querySelector('.btn-update');
const tituloForm = $('#titulo-form');

// Util
function getQueryId() {
  const p = new URLSearchParams(window.location.search);
  return p.get('id');
}
function limpiarFormulario() {
  form.reset();
  imgPreview.src = 'https://via.placeholder.com/400x300?text=Vista+previa';
  inpId.value = '';
}
function setModoEdicion(on) {
  if (on) {
    btnCreate.classList.add('d-none');
    btnUpdate.classList.remove('d-none');
    tituloForm.textContent = 'Editar Producto';
  } else {
    btnCreate.classList.remove('d-none');
    btnUpdate.classList.add('d-none');
    tituloForm.textContent = 'Crear Producto';
  }
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
async function cargarProducto(id) {
  const data = await api('GET', null, `id=${encodeURIComponent(id)}`);
  // Se asume estructura: { id, nombre, descripcion, precio, stock, imagen }
  inpId.value = data.id;
  inpNombre.value = data.nombre ?? '';
  inpPrecio.value = data.precio ?? '';
  inpStock.value = data.stock ?? '';
  inpImagenUrl.value = data.imagen ?? '';
  txtDesc.value = data.descripcion ?? '';
  imgPreview.src = data.imagen || 'https://via.placeholder.com/400x300?text=Vista+previa';
}
function validarPayload(p) {
  const errors = [];
  if (!p.nombre) errors.push('El nombre es obligatorio.');
  if (!p.precio || Number(p.precio) <= 0) errors.push('El precio debe ser mayor a 0.');
  if (p.stock == null || String(p.stock).trim() === '') errors.push('El stock es obligatorio.');
  if (!p.descripcion) errors.push('La descripción es obligatoria.');
  return errors;
}

// Eventos
inpImagenUrl.addEventListener('input', () => {
  const u = inpImagenUrl.value.trim();
  imgPreview.src = u || 'https://via.placeholder.com/400x300?text=Vista+previa';
});

btnCreate.addEventListener('click', async () => {
  const payload = {
    nombre: inpNombre.value.trim(),
    descripcion: txtDesc.value.trim(),
    precio: Number(inpPrecio.value),
    stock: Number(inpStock.value),
    imagen: inpImagenUrl.value.trim(),
  };
  const errors = validarPayload(payload);
  if (errors.length) return alert(errors.join('\n'));
  try {
    await api('POST', payload);
    alert('Producto creado con éxito');
    limpiarFormulario();
  } catch (e) {
    console.error(e);
    alert(e.message || 'Error al crear producto');
  }
});

btnUpdate.addEventListener('click', async () => {
  const id = inpId.value;
  if (!id) return alert('ID de producto no válido.');
  const payload = {
    id: Number(id),
    nombre: inpNombre.value.trim(),
    descripcion: txtDesc.value.trim(),
    precio: Number(inpPrecio.value),
    stock: Number(inpStock.value),
    imagen: inpImagenUrl.value.trim(),
  };
  const errors = validarPayload(payload);
  if (errors.length) return alert(errors.join('\n'));
  try {
    await api('PUT', payload);
    alert('Producto actualizado con éxito');
    // Opcional: regresar al listado
    window.location.href = 'listado-pro.html';
  } catch (e) {
    console.error(e);
    alert(e.message || 'Error al actualizar producto');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const id = getQueryId();
  if (id) {
    setModoEdicion(true);
    try {
      await cargarProducto(id);
    } catch (e) {
      console.error(e);
      alert(e.message || 'No se pudo cargar el producto');
    }
  } else {
    setModoEdicion(false);
  }
});
