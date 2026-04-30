//API da conexão com o banco de dados
const API_URL = "https://localhost:7223/api/produto";
//Array que irá servir de "banco de dados local"
let produtosCadastrados = [];

//Função básica para calcular o imposto
const calcularImposto = (tipoProduto) => {
    const tipo = Number(tipoProduto);
    switch (tipo) {
        case 1: return 0;
        case 2: return 0.08;
        case 3: return 0.1;
        case 4: return 0.12;
        case 5: return 0.17;
        default: return 0;
    }
}

// Função para renderizar os produtos cadastrados, ele recebe a lista dos produtos e a informação se está utilizando a api externa ou um modo ofline
const renderizarProdutos = (listaDeProdutos, usandoApi) => {
    const containerVitrine = document.querySelector('.exibir-produtos');
    containerVitrine.innerHTML = '';

    //Percorre a lista de produtos
    listaDeProdutos.forEach((produto) => {
        // Variáveis para padronizar os dados, não importa de onde venham
        let id, nome, caracteristicas, valorUnitario, quantidade, tipo;
        let valorImpostoTotal, valorFinalTotal;

        //Se os dados vieram da api, precisa marca-los exatamente igual aomo vieram no c#
        if (usandoApi) {
            id = produto.Id;
            nome = produto.Nome;
            caracteristicas = produto.Descricao; 
            valorUnitario = produto.ValorUnitario;
            quantidade = produto.Quantidade;
            tipo = produto.TipoImposto; 
            valorImpostoTotal = produto.ValorDoImpostoTotal;
            valorFinalTotal = produto.ValorFinal;
        }else {
            id = produto.id;
            nome = produto.nome;
            caracteristicas = produto.caracteristicas;
            valorUnitario = produto.valorUnitario;
            quantidade = produto.quantidade;
            tipo = produto.tipo;
            // Fazemos a matemática localmente usando a sua função
            const impostoPercentual = calcularImposto(tipo);
            const valorImpostoUnitario = valorUnitario * impostoPercentual;
            valorImpostoTotal = valorImpostoUnitario * quantidade;
            valorFinalTotal = (valorUnitario + valorImpostoUnitario) * quantidade;
        }

        // Criando o card com as suas classes
        const cardProduto = document.createElement('div');
        cardProduto.classList.add('produto-simulado');

        cardProduto.innerHTML = `
            <h2>${nome}</h2>
            <p><small>${caracteristicas}</small></p>
            <p>Valor Total: R$ <span>${valorFinalTotal.toFixed(2)}</span></p>
            <p>Valor do Produto (Unidade): R$ <span>${valorUnitario.toFixed(2)}</span></p>
            <p>Valor do Imposto (Total): R$ <span>${valorImpostoTotal.toFixed(2)}</span></p>
            <p>Quantidade: <span>${quantidade}</span></p>
            <p>Tipo: <span>${tipo}</span></p>
            <button class="btn-form" onclick="prepararEdicao(${JSON.stringify(produto)})">Editar</button>
            <button class="btn-form" onclick="removerProduto(${id})">Remover</button>
        `;
        containerVitrine.appendChild(cardProduto);
    });
}

//Função para atualizar a exibição dos livros, decidir se vai usar api ou armazenamento remoto
const atualizarVitrine = async () => {
  try {
    const resposta = await fetch(API_URL, {
        //Programação Orientada a I.A
        method: 'GET',
        mode: 'cors', // Força o modo CORS
        headers: {
            'Content-Type': 'application/json'
        }
    }); 
    
    if (!resposta.ok) throw new Error("Erro na API");
    const produtosDaApi = await resposta.json();
    //Se tudo der certo, ele renderiza com os dados da api
    renderizarProdutos(produtosDaApi, true);

  } catch (erro) {
    console.error("Erro real detectado:", erro);
    //Se der errado, ele rendriza com o armazenamento local
    renderizarProdutos(produtosCadastrados, false);
  }
}

//Função de adicionar produto
const adicionarProduto = async (evento) => {
    evento.preventDefault();
    const form = document.getElementById('form-produto');
    
    const inputNome = document.getElementById('produto');
    const inputCarac = document.getElementById('descricao');
    const inputValor = document.getElementById('valor');
    const inputQuantidade = document.getElementById('quantidade');
    const inputTipo = document.getElementById('tipo');

    // 1. Prepara o pacote para a API (com os nomes que o C# espera)
    const pacoteParaApi = {
        nome: inputNome.value,
        descricao: inputCarac.value,
        valorUnitario: Number(inputValor.value),
        quantidade: Number(inputQuantidade.value),
        tipoImposto: Number(inputTipo.value)
    };

    // 2. Prepara o pacote para o seu Modo Local
    const pacoteLocal = {
        id: Date.now(),
        nome: inputNome.value,
        caracteristicas: inputCarac.value,
        valorUnitario: Number(inputValor.value),
        quantidade: Number(inputQuantidade.value),
        tipo: Number(inputTipo.value),
    };

    try {
        // Tenta enviar para o C#
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pacoteParaApi)
        });
        
        if (!resposta.ok) throw new Error("API recusou o cadastro.");
    } catch (erro) {
        // Se falhou (API offline), salva no seu array!
        produtosCadastrados = [...produtosCadastrados, pacoteLocal];
    }

    // Após tentar salvar (onde quer que seja), atualiza a tela
    atualizarVitrine();

    // Limpa o form e aplica o seu bônus visual
    form.reset();
    inputNome.focus();
    
    const cadastro = document.querySelector('.inserir-info-container');
    const exibicao = document.querySelector('.exibir-produtos');
    exibicao.classList.add('ativo');
    cadastro.classList.remove('ativo');
}

const removerProduto = async (idProduto) => {
    // Pergunta antes de deletar (opcional, mas bom)
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
        const resposta = await fetch(`${API_URL}/${idProduto}`, {
            method: 'DELETE',
            mode: 'cors'
        });

        if (!resposta.ok) throw new Error("Erro ao deletar na API");

        console.log("Produto removido com sucesso!");
        
        // Atualiza a vitrine para sumir o card da tela
        atualizarVitrine();

    } catch (erro) {
        console.error("Erro ao remover:", erro);
        // Fallback para o modo local caso a API falhe
        produtosCadastrados = produtosCadastrados.filter(p => p.id !== idProduto);
        atualizarVitrine();
    }
}

let idSendoEditado = null; // Variável global para saber se estamos editando

const prepararEdicao = (produto) => {
    // Preenche o formulário com os dados do produto
    document.getElementById('produto').value = produto.Nome || produto.nome;
    document.getElementById('descricao').value = produto.Descricao || produto.caracteristicas;
    document.getElementById('valor').value = produto.ValorUnitario || produto.valorUnitario;
    document.getElementById('quantidade').value = produto.Quantidade || produto.quantidade;
    document.getElementById('tipo').value = produto.TipoImposto || produto.tipo;

    idSendoEditado = produto.Id || produto.id; // Guarda o ID

    // Muda o foco e mostra o formulário
    document.querySelector('.inserir-info-container').classList.add('ativo');
    document.getElementById('produto').focus();
};

// Modifique sua função adicionarProduto para lidar com o "Salvar Edição"
const salvarProduto = async (evento) => {
    evento.preventDefault();
    
    const dados = {
        nome: document.getElementById('produto').value,
        descricao: document.getElementById('descricao').value,
        valorUnitario: Number(document.getElementById('valor').value),
        quantidade: Number(document.getElementById('quantidade').value),
        tipoImposto: Number(document.getElementById('tipo').value)
    };

    try {
        let url = API_URL;
        let metodo = 'POST';

        // Se tiver um ID sendo editado, muda para PUT e aponta para o ID
        if (idSendoEditado) {
            url = `${API_URL}/${idSendoEditado}`;
            metodo = 'PUT';
            dados.id = idSendoEditado;
        }

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro na API");

        idSendoEditado = null; // Reseta o estado de edição
        atualizarVitrine();
        document.getElementById('form-produto').reset();

    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}

// Inicia os eventos
const formProduto = document.getElementById('form-produto');
formProduto.addEventListener('submit', adicionarProduto);

// Quando a página carregar, já tenta puxar os dados
atualizarVitrine();