// js/local.js

const d = document;
const nameUser = d.querySelector('#nombre-usuario');
const btnLogout = d.querySelector('#btnLogout');

// Pintar usuario cuando cargue el DOM
d.addEventListener('DOMContentLoaded', () => {
  try {
    const raw = localStorage.getItem('userLogin');
    if (!raw) {
      if (nameUser) nameUser.textContent = 'Invitado';
      return;
    }
    const data = JSON.parse(raw);
    // data esperado: { user: 'usuario', rol: '...' }
    const label = data?.user || 'Invitado';
    if (nameUser) nameUser.textContent = label;
  } catch (e) {
    console.error('Error leyendo userLogin:', e);
    if (nameUser) nameUser.textContent = 'Invitado';
  }
});

// Logout
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('userLogin');
  // Si vas a invalidar sesión en back, podrías hacer un fetch aquí.
  window.location.href = 'login.html';
});
