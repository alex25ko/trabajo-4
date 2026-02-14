const socket = io();

let nombreUsuario = '';
let conectado = false;

// Elementos del DOM
const modalConexion = document.getElementById('modalConexion');
const areaMensajes = document.getElementById('areaMensajes');
const areaEntrada = document.getElementById('areaEntrada');
const inputNombre = document.getElementById('inputNombre');
const btnConectar = document.getElementById('btnConectar');
const inputMensaje = document.getElementById('inputMensaje');
const btnEnviar = document.getElementById('btnEnviar');
const contenedorMensajes = document.getElementById('contenedorMensajes');
const listaUsuarios = document.getElementById('listaUsuarios');

// Evento: conectar al chat
btnConectar.addEventListener('click', () => {
  const nombre = inputNombre.value.trim();
  
  if (nombre === '') {
    alert('Por favor ingresa un nombre');
    return;
  }

  nombreUsuario = nombre;
  socket.emit('usuario_conectado', nombre);
  conectado = true;

  // Mostrar chat
  modalConexion.style.display = 'none';
  areaMensajes.style.display = 'block';
  areaEntrada.style.display = 'flex';
  inputMensaje.focus();
});

// Evento: enviar mensaje
btnEnviar.addEventListener('click', enviarMensaje);

inputMensaje.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

function enviarMensaje() {
  const mensaje = inputMensaje.value.trim();
  
  if (mensaje === '') return;

  socket.emit('enviar_mensaje', { mensaje: mensaje });
  inputMensaje.value = '';
  inputMensaje.focus();
}

// Evento: recibir nuevo mensaje
socket.on('nuevo_mensaje', (data) => {
  agregarMensaje(data);
});

// Evento: usuario conectado
socket.on('usuario_conectado', (data) => {
  agregarNotificacion(`✓ ${data.nombre} se ha conectado`);
  actualizarUsuarios(data.usuariosActivos);
});

// Evento: usuario desconectado
socket.on('usuario_desconectado', (data) => {
  agregarNotificacion(`✗ ${data.nombre} se ha desconectado`);
  actualizarUsuarios(data.usuariosActivos);
});

// Evento: usuarios activos
socket.on('usuarios_activos', (usuarios) => {
  actualizarUsuarios(usuarios);
});

function agregarMensaje(data) {
  const divMensaje = document.createElement('div');
  divMensaje.className = 'mensaje ' + (data.nombre === nombreUsuario ? 'propio' : 'ajeno');

  const esPropio = data.nombre === nombreUsuario;
  
  divMensaje.innerHTML = `
    <div class="mensaje-info">
      ${esPropio ? 'Tú' : data.nombre} - ${data.timestamp}
    </div>
    <div class="mensaje-contenido">
      ${escaparHTML(data.contenido)}
    </div>
  `;

  contenedorMensajes.appendChild(divMensaje);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function agregarNotificacion(texto) {
  const divNotificacion = document.createElement('div');
  divNotificacion.className = 'mensaje-notificacion';
  divNotificacion.textContent = texto;
  
  contenedorMensajes.appendChild(divNotificacion);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function actualizarUsuarios(usuarios) {
  listaUsuarios.innerHTML = '';
  
  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.className = 'usuario-item activo';
    li.textContent = usuario.nombre;
    listaUsuarios.appendChild(li);
  });
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Solicitar usuarios activos al conectar
socket.on('connect', () => {
  inputNombre.focus();
});
