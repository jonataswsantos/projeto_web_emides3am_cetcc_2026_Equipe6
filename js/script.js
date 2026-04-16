let produtosCadastrados = []

const calcularImposto = (tipoProduto) => {
    const tipo = Number(tipoProduto)
    switch (tipo) {
        case 1:
            return 0
        case 2:
            return 0.08
        case 3:
            return 0.1
        case 4:
            return 0.12
        case 5:
            return 0.17
        default:
            return 0
    }
}

const removerProduto = (idProduto) => {
    produtosCadastrados = produtosCadastrados.filter(
        (produto) => produto.id !== idProduto
    )
    renderizarProdutos()
}

const renderizarProdutos = () => {
    // Aponta para a div pai exata que você criou no HTML
    const containerVitrine = document.querySelector('.exibir-produtos')
    containerVitrine.innerHTML = ''

    produtosCadastrados.forEach((produto) => {
        const { id, nome, caracteristicas, valorUnitario, quantidade, tipo } = produto

        // Cálculos
        const impostoPercentual = calcularImposto(tipo)
        const valorImpostoUnitario = valorUnitario * impostoPercentual
        const valorTotalUnitario = valorUnitario + valorImpostoUnitario
        const valorFinalTotal = valorTotalUnitario * quantidade

        // Criando o card usando as suas classes CSS originais
        const cardProduto = document.createElement('div')
        cardProduto.classList.add('produto-simulado')

        cardProduto.innerHTML = `
            <h2>${nome}</h2>
            <p><small>${caracteristicas}</small></p>
            <p>Valor Total: R$ <span>${valorFinalTotal.toFixed(2)}</span></p>
            <p>Valor do Produto (Unidade): R$ <span>${valorUnitario.toFixed(2)}</span></p>
            <p>Valor do Imposto (Total): R$ <span>${(valorImpostoUnitario * quantidade).toFixed(2)}</span></p>
            <p>Quantidade: <span>${quantidade}</span></p>
            <p>Tipo: <span>${tipo}</span></p>
            <button class="btn-rmv" onclick="removerProduto(${id})">Remover</button>
        `

        containerVitrine.appendChild(cardProduto)
    })
}

const adicionarProduto = (evento) => {
    evento.preventDefault()

    const form = document.getElementById('form-produto')
    
    // Capturando os dados pelos IDs que você já tinha no HTML
    const inputNome = document.getElementById('produto')
    const inputCarac = document.getElementById('descricao')
    const inputValor = document.getElementById('valor')
    const inputQuantidade = document.getElementById('quantidade')
    const inputTipo = document.getElementById('tipo')

    const novoProduto = {
        id: Date.now(),
        nome: inputNome.value,
        caracteristicas: inputCarac.value,
        valorUnitario: Number(inputValor.value),
        quantidade: Number(inputQuantidade.value),
        tipo: Number(inputTipo.value),
    }

    produtosCadastrados = [...produtosCadastrados, novoProduto]
    renderizarProdutos()

    form.reset()
    inputNome.focus()

    // Bônus: Força a transição visual para a aba "exibição" logo após o cadastro
    const cadastro = document.querySelector('.inserir-info-container')
    const exibicao = document.querySelector('.exibir-produtos')
    exibicao.classList.add('ativo')
    cadastro.classList.remove('ativo')
}

const formProduto = document.getElementById('form-produto')
formProduto.addEventListener('submit', adicionarProduto)