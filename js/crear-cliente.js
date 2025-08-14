// js/crear-cliente.js

const API_CLIENTES = 'http://localhost/backend-apiCrud/index.php?url=clientes';

// Selectores
const form = document.getElementById('form-cliente');
const btnCreate = document.querySelector('.btn-create');
const btnUpdate = document.querySelector('.btn-update'); // reservado para futuro

function getFormData() {
  return {
    nombre: document.getElementById('nombre-cliente').value.trim(),
    apellido: document.getElementById('apellido-cliente').value.trim(),
    email: document.getElementById('email-cliente').value.trim(),
    celular: document.getElementById('celular-cliente').value.trim(),
    direccion: document.getElementById('direccion-cliente').value.trim(),
    direccion2: document.getElementById('direccion2-cliente').value.trim(),
    descripcion: document.getElementById('descripcion-cliente').value.trim(),
  };
}

function validate(data) {
  const errors = [];
  if (!data.nombre) errors.push('El nombre es obligatorio.');
  if (!data.apellido) errors.push('El apellido es obligatorio.');
  if (!data.email) errors.push('El email es obligatorio.');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('El email no es válido.');
  if (!data.celular) errors.push('El celular es obligatorio.');
  if (!data.direccion) errors.push('La dirección principal es obligatoria.');
  return errors;
}

async function apiCreateCliente(payload) {
  const res = await fetch(API_CLIENTES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data;
  try { data = await res.json(); } catch { throw new Error('La respuesta del servidor no es JSON válido'); }
  if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`);
  return data; // {message, id}
}

btnCreate?.addEventListener('click', async () => {
  const data = getFormData();
  const errors = validate(data);
  if (errors.length) {
    alert(errors.join('\n'));
    return;
  }
  btnCreate.disabled = true;
  const original = btnCreate.innerText;
  btnCreate.innerText = 'Guardando...';

  try {
    const resp = await apiCreateCliente(data);
    alert(resp.message || 'Cliente creado con éxito');
    form.reset();
    // Si deseas redirigir:
    // window.location.href = 'listado-clientes.html';
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    btnCreate.disabled = false;
    btnCreate.innerText = original;
  }
});
