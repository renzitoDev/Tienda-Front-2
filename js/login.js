// js/login.js

// Selectores
const d = document;
const userInput = d.querySelector('#usuarioForm');
const passInput = d.querySelector('#contraForm');
const btnLogin = d.querySelector('.btnLogin');

// Endpoint backend (ajusta si tu host/carpeta cambia)
const API_LOGIN = 'http://localhost/backend-apiCrud/index.php?url=login';

function validateCredentials(user, pass) {
  if (!user || !pass) return 'El usuario y la contraseña son obligatorios';
  if (user.length < 3) return 'El usuario debe tener al menos 3 caracteres';
  if (pass.length < 3) return 'La contraseña debe tener al menos 3 caracteres';
  return null;
}

async function doLogin({ usuario, contrasena }) {
  const res = await fetch(API_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ usuario, contrasena })
  });

  if (res.status === 401) {
    throw new Error('El usuario y/o la contraseña es incorrecto');
  }
  // El backend puede no devolver siempre JSON válido si hay warnings.
  let data;
  try { data = await res.json(); } catch { throw new Error('Respuesta del servidor no es JSON válido'); }
  if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`);

  // Esperado: { id, rol, usuario, contrasena }
  if (!data || !data.usuario) throw new Error('Respuesta de login incompleta');

  // Guardar sesión de forma consistente con el resto del front
  localStorage.setItem('userLogin', JSON.stringify({ user: data.usuario, rol: data.rol }));

  return data;
}

btnLogin?.addEventListener('click', async (e) => {
  e.preventDefault();
  const usuario = userInput?.value?.trim();
  const contrasena = passInput?.value?.trim();

  const err = validateCredentials(usuario, contrasena);
  if (err) { alert(err); return; }

  btnLogin.disabled = true;
  const originalText = btnLogin.innerText;
  btnLogin.innerText = 'Ingresando...';

  try {
    const user = await doLogin({ usuario, contrasena });
    alert(`Bienvenido: ${user.usuario}`);
    // Redirige a index
    window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerText = originalText;
    // Limpieza opcional
    // userInput.value = '';
    // passInput.value = '';
  }
});
