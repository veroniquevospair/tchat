const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = 8888;
let joueurs = [];

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', (socket) => {
  console.log('Un joueur est connecté :', socket.id);

  socket.on('entrer', (nom) => {
    if (joueurs.length >= 4) {
      socket.emit('erreur', 'La partie est pleine (4 joueurs max).');
      return;
    }

    const joueur = {
      id: socket.id,
      nom: nom
    };

    joueurs.push(joueur);
    socket.emit('entreeConfirmee', joueur);
    io.emit('majJoueurs', joueurs);
    console.log(`${nom} a rejoint la partie.`);
  });

  socket.on('sortir', () => {
    const joueur = joueurs.find(j => j.id === socket.id);
    if (joueur) {
      joueurs = joueurs.filter(j => j.id !== socket.id);
      io.emit('majJoueurs', joueurs);
      console.log(`${joueur.nom} a quitté la partie.`);
    }
  });

  socket.on('nouveauMessage', (msg) => {
    const joueur = joueurs.find(j => j.id === socket.id);
    if (joueur) {
      const messageFormate = `${joueur.nom} : ${msg}`;
      io.emit('messageDiffuse', messageFormate);
    }
  });

  socket.on('disconnect', () => {
    const joueur = joueurs.find(j => j.id === socket.id);
    if (joueur) {
      joueurs = joueurs.filter(j => j.id !== socket.id);
      io.emit('majJoueurs', joueurs);
      console.log(`${joueur.nom} s'est déconnecté.`);
    }
  });
});
