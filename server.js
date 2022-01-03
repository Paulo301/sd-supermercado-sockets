const net = require('net');
const dotenv = require('dotenv');

dotenv.config();

NUM_PORTA = process.env.PORT || 3333;

const bdProdutos = [
  {
    id: 0,
    nome: "Pão",
    preco: 4
  },
  {
    id: 1,
    nome: "Suco",
    preco: 5
  },
  {
    id: 2,
    nome: "Arroz",
    preco: 20.50
  },
  {
    id: 3,
    nome: "Feijão",
    preco: 9.90
  },
  {
    id: 4,
    nome: "Farinha de trigo",
    preco: 3.15
  }
];
let carrinho = [];
let pedidos = [];

//item do carrinho: {idCarrinho, produto, quantidade}
//pedido: {idPedido, produtos, status}

// Criar o objeto servidor e registrar a função principal de manipulação da conexão
const server = net.createServer(connectionListener);

server.listen(NUM_PORTA, "0.0.0.0", () => {
    console.log(`Servidor iniciado! Escutando na porta ${NUM_PORTA}`);
});

function connectionListener(socket) {
  socket.on("data", (data) => {
    const dataString = data.toString().trim();

    const params = dataString.split(",");

    console.log(params);

    switch (params[0]) {
      case "Listar_Produtos":
        let result = "";

        bdProdutos.forEach((produto) => {
          result += `Id: ${produto.id} \nNome: ${produto.nome} \nPreço: ${produto.preco}\n\n`;
        });

        socket.write(result);
        break;

      case "Adicionar_Carrinho":
        const tempProduto = bdProdutos.find((produto) => produto.id.toString() === params[1]);
        if(tempProduto){
          const tam = carrinho.length;
          carrinho.push(
            {
              idCarrinho: tam ? carrinho[tam - 1].idCarrinho + 1 : 0,
              produto: tempProduto,
              quantidade: params[2]
            }
          )
          socket.write("Produto adicionado com sucesso!\n");
        } else{
          socket.write("Id inválida\n");
        }
        break;

      case "Remover_Carrinho":
        const tempProduto = carrinho.find((produto) => produto.idCarrinho.toString() === params[1]);
        if(tempProduto){
          const tempCarrinho = carrinho.filter((produto) => produto.idCarrinho.toString() !== params[1]);
          carrinho = tempCarrinho;
          socket.write("Produto removido com sucesso\n");
        } else {
          socket.write("Id inválida\n");
        }
        break;

      case "Listar_Carrinho":
        let result = "";
        let total = 0;

        carrinho.forEach((produto) => {
          result += 
            `IdCarrinho: ${produto.idCarrinho} \n`+
            `Produto: \n${`>>id: ${produto.produto.id} \n>>nome: ${produto.produto.nome} \n>>preço: ${produto.produto.preco}\n`} \n`+
            `Quantidade: ${produto.quantidade}\n\n`
          ;
          total += produto.produto.preco*produto.quantidade;
        });

        result += `Total: ${total} \n`;

        socket.write(result);
        break;

      case "Pagar":
        if(carrinho.length){
          const tam = pedidos.length;
          pedidos.push(
            {
              idPedido: tam ? pedidos[tam - 1].idPedido + 1 : 0,
              produtos: carrinho.map((produto) => {
                const {idCarrinho, ...resto} = produto;
                return {...resto};
              }),
              status: "Pago"
            }
          )
          socket.write("Pedido pago com sucesso!\n");
        } else {
          socket.write("O carrinho está vazio\n");
        }

        socket.write(result);
        break;

      case "Solicitar_Entrega":
        const tempPedido = pedidos.find((pedido) => pedido.idPedido.toString() === params[1]);
        if(tempPedido){
          const tempPedidos = pedidos.map((pedido) => {
            if(pedido.idPedido.toString() === params[1]){
              return {...pedido, status: "Entrega solicitada"}
            } else{
              return pedido;
            }
          });
          pedidos = tempPedidos;
          socket.write("Entrega solicitada com sucesso\n");
        } else {
          socket.write("Id inválida\n");
        }
        break;

      case "Listar_Pedidos":
        let result = "";

        pedidos.forEach((pedido) => {
          let tempProdutos = "";
          let total = 0;
          pedido.produtos.forEach((produto) => {
            tempProdutos += 
              `>Produto: \n${`>>id: ${produto.produto.id} \n>>nome: ${produto.produto.nome} \n>>preço: ${produto.produto.preco}\n`} \n`+
              `>Quantidade: ${produto.quantidade}\n\n`
            ;
            total += produto.produto.preco*produto.quantidade;
          });
          result += 
            `IdPedido: ${pedido.idPedido} \n`+
            `Produto: \n${tempProdutos}\n`+
            `Total: ${total}\n\n`
          ;
        });

        result += `Total: ${total} \n`;

        socket.write(result);
        break;
      
      case "Sair":
        console.log("Desconectado");
        socket.end();
        break;

      default:
        socket.write("-ERRO Comando não reconhecido\n");
    }
  });
}