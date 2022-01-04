const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const socket = new net.Socket();
let isInMenu = true;
let menuOption = "";
const bufferDelay = 1;

const delayFunction = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const connectionListener = async () => {
  console.log("Conectado ao servidor!");

  console.log("Digite:"+
                "\n>>>1 -> para listar os produtos"+
                "\n>>>2 -> para adicionar produtos no carrinho"+
                "\n>>>3 -> para remover produtos do carrinho"+
                "\n>>>4 -> para os produtos no carrinho"+
                "\n>>>5 -> para pagar os produtos no carrinho"+
                "\n>>>6 -> para solicitar a entrega de um pedido"+
                "\n>>>7 -> para listar os pedidos"+
                "\n>>>8 -> para sair");

  socket.on("data", (data) => {
    const dataString = data.toString().trim();

    console.log("Resposta do servidor: \n" + dataString);
    console.log("Digite:"+
                "\n>>>1 -> para listar os produtos"+
                "\n>>>2 -> para adicionar produtos no carrinho"+
                "\n>>>3 -> para remover produtos do carrinho"+
                "\n>>>4 -> para listar os produtos no carrinho"+
                "\n>>>5 -> para pagar os produtos no carrinho"+
                "\n>>>6 -> para solicitar a entrega de um pedido"+
                "\n>>>7 -> para listar os pedidos"+
                "\n>>>8 -> para sair");
    menuOption = "";
    isInMenu = true;
  });
}

socket.connect(8100, "127.0.0.1", connectionListener);

rl.on('line', line => {
  if(isInMenu){
    menuOption = line.trim();
    isInMenu = false;
    if(line.trim()==="1"){
      socket.write("Listar_Produtos");
    } else if(line.trim()==="2"){
      console.log("Digite a id do produto e a quantidade dele, separadas por virgula: Ex: 1, 3");
    } else if(line.trim()==="3"){
      console.log("Digite a id do produto a ser removido do carrinho");
    } else if(line.trim()==="4"){
      socket.write("Listar_Carrinho");
    } else if(line.trim()==="5"){
      socket.write("Pagar");
    } else if(line.trim()==="6"){
      console.log("Digite a id do pedido para solicitar a entrega");
    } else if(line.trim()==="7"){
      socket.write("Listar_Pedidos");
    } else if(line.trim()==="8"){
      socket.write("Sair");
    } else {
      menuOption = "";
      isInMenu = true;
      console.log("Você digitou uma opção inválida");
    }
  } else {
    if(menuOption==="2"){
      socket.write("Adicionar_Carrinho,"+line);
    } else if(menuOption==="3"){
      socket.write("Remover_Carrinho,"+line);
    } else if(menuOption==="6"){
      socket.write("Solicitar_Entrega,"+line);
    }
  }
});