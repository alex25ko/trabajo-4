const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Almacenar usuarios conectados
const usuarios = {};

// Evento cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Evento cuando un usuario se registra con su nombre
  socket.on('usuario_conectado', (nombre) => {
    usuarios[socket.id] = {
      id: socket.id,
      nombre: nombre,
      timestamp: new Date()
    };

    console.log(`${nombre} se ha conectado`);

    // Notificar a todos que un usuario se conectó
    io.emit('usuario_conectado', {
      nombre: nombre,
      usuariosActivos: Object.values(usuarios)
    });
  });

  // Evento para recibir mensajes
  socket.on('enviar_mensaje', (data) => {
    const usuario = usuarios[socket.id];
    const mensaje = {
      id: socket.id,
      nombre: usuario.nombre,
      contenido: data.mensaje,
      timestamp: new Date().toLocaleTimeString()
    };

    console.log(`${usuario.nombre}: ${data.mensaje}`);

    // Enviar mensaje a todos los clientes
    io.emit('nuevo_mensaje', mensaje);
  });

  // Evento cuando un usuario se desconecta
  socket.on('disconnect', () => {
    const usuario = usuarios[socket.id];
    if (usuario) {
      console.log(`${usuario.nombre} se ha desconectado`);
      delete usuarios[socket.id];

      io.emit('usuario_desconectado', {
        nombre: usuario.nombre,
        usuariosActivos: Object.values(usuarios)
      });
    }
  });

  // Evento para obtener lista de usuarios activos
  socket.on('obtener_usuarios', () => {
    socket.emit('usuarios_activos', Object.values(usuarios));
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
