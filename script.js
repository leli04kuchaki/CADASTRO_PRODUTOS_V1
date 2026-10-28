
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


const listaDeProdutos = [];

const CHAVE_STORAGE = "sistema_estoque_produtos";


const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");
const tabelaBody = document.querySelector("#tabela-produtos tbody");
const mensagemVazia = document.getElementById("mensagem-vazia");


const formatoMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});


function salvarNoLocalStorage() {
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(listaDeProdutos)
    );
}


function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) return;

    try {
        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            throw new Error("Dados inválidos");
        }

        produtosSalvos.forEach((prod) => {
            listaDeProdutos.push(
                new Produto(prod.nome, prod.preco, prod.quantidade)
            );
        });
    } catch (erro) {
        alert("Não foi possível carregar os produtos salvos.");
    }
}


formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = Number(
        document.getElementById("quantidade").value
    );


    if (
        nome === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade < 1
    ) {
        alert("Preencha os campos com valores válidos.");
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    listaDeProdutos.push(novoProduto);

    salvarNoLocalStorage();
    atualizarInterface();

    formProduto.reset();
    document.getElementById("nome").focus();
});


function obterProdutosFiltrados() {
    const termo = campoBusca.value.trim().toLowerCase();

    return listaDeProdutos
        .map((produto, index) => ({ produto, index }))
        .filter((item) => {
            return item.produto.nome
                .toLowerCase()
                .includes(termo);
        });
}


function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acumulador, item) => {
        return acumulador + item.produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: ${formatoMoeda.format(total)}`;
}


function renderizarTabela(produtosVisiveis) {
    tabelaBody.innerHTML = "";

    produtosVisiveis.forEach((item) => {
        const produto = item.produto;
        const indexOriginal = item.index;

        const linha = document.createElement("tr");


        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = formatoMoeda.format(produto.preco);

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent =
            formatoMoeda.format(produto.calcularSubtotal());

        const celulaAcoes = document.createElement("td");
        const botaoRemover = document.createElement("button");

        botaoRemover.textContent = "Remover";
        botaoRemover.classList.add("btn-remover");
        botaoRemover.type = "button";

        botaoRemover.addEventListener("click", () => {
            removerProduto(indexOriginal);
        });

        celulaAcoes.appendChild(botaoRemover);

        linha.append(
            celulaNome,
            celulaPreco,
            celulaQuantidade,
            celulaSubtotal,
            celulaAcoes
        );

        tabelaBody.appendChild(linha);
    });


    mensagemVazia.hidden = produtosVisiveis.length > 0;

    if (produtosVisiveis.length === 0) {
        mensagemVazia.textContent = campoBusca.value.trim()
            ? "Nenhum produto encontrado para essa pesquisa."
            : "Nenhum produto cadastrado ainda.";
    }
}


function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    salvarNoLocalStorage();
    atualizarInterface();
}


btnLimparTudo.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        alert("A lista de produtos já está vazia!");
        return;
    }

    const confirmar = confirm(
        "Tem certeza que deseja remover todos os produtos?"
    );

    if (confirmar) {
        listaDeProdutos.length = 0;

        salvarNoLocalStorage();
        atualizarInterface();
    }
});


campoBusca.addEventListener("input", function() {
    atualizarInterface();
});


function atualizarInterface() {
    const produtosVisiveis = obterProdutosFiltrados();

    renderizarTabela(produtosVisiveis);
    atualizarTotalEstoque(produtosVisiveis);
}


carregarDoLocalStorage();
atualizarInterface();
