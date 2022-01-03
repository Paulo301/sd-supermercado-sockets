const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const socket = new net.Socket();

const delayFunction = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, delay);
  });
}

const connectionListener = async () => {
  console.log("Conectado ao servidor!");

  socket.on("data", (data) => {
    const dataString = data.toString().trim();

    console.log("Resposta do servidor: " + dataString);
  });

  const bufferDelay = 1;

  socket.write("ADICIONAR 1 CALABRESA 5\r\n");
  await delayFunction(bufferDelay);

  socket.write("SAIR\r\n");
}

socket.connect(8100, "127.0.0.1", connectionListener);

rl.on('line', line => {
  if(line.slice(0,5)==="/join"){ 
    client.publish('entrar-sala', JSON.stringify({user: user, data: line.slice(6)}));
  }
});