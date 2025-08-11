// URL da API que traz as taxas de câmbio
const API_BASE = "https://api.exchangerate-api.com/v4/latest/";

// Pega os elementos do HTML q
const form = document.getElementById("formConverter");
const valorInput = document.getElementById("valor");
const moedaOrigem = document.getElementById("moedaOrigem");
const moedaDestino = document.getElementById("moedaDestino");
const btnConverter = document.getElementById("btnConverter");
const btnInvert = document.getElementById("btnInvert");
const resultado = document.getElementById("resultado");
const infoTaxa = document.getElementById("infoTaxa");
const historyList = document.getElementById("historyList");

const STORAGE_KEY = "meuHistoricoDeConversoes";

// Função pra puxar as moedas e colocar nos selects
async function carregaAsMoedas() {
  try {
    const res = await fetch(API_BASE + "USD");
    const dados = await res.json();
    const moedas = Object.keys(dados.rates).sort();

    moedaOrigem.innerHTML = "";
    moedaDestino.innerHTML = "";

    moedas.forEach((moeda) => {
      moedaOrigem.innerHTML += `<option value="${moeda}">${moeda}</option>`;
      moedaDestino.innerHTML += `<option value="${moeda}">${moeda}</option>`;
    });

    moedaOrigem.value = "USD";
    moedaDestino.value = "BRL";

    carregarHistorico();
  } catch (e) {
    resultado.textContent = "Deu ruim ao carregar as moedas ";
  }
}

//  localStorage
function salvaHistorico(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}


function carregarHistorico() {
  const historicoSalvo = localStorage.getItem(STORAGE_KEY);
  if (historicoSalvo) {
    const lista = JSON.parse(historicoSalvo);
    historyList.innerHTML = "";
    lista.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
    });
  }
}


function adicionaNoHistorico(texto) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleString()} — ${texto}`;
  historyList.prepend(li);


  const itens = Array.from(historyList.querySelectorAll("li")).map(
    (li) => li.textContent
  );


  if (itens.length > 10) {
    historyList.removeChild(historyList.lastChild);
    itens.pop();
  }

  salvaHistorico(itens);
}


function trocaMoedas() {
  const temp = moedaOrigem.value;
  moedaOrigem.value = moedaDestino.value;
  moedaDestino.value = temp;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fazAConversao();
});

btnInvert.addEventListener("click", trocaMoedas);


async function fazAConversao() {
  const valor = parseFloat(valorInput.value);
  if (!valor || valor <= 0) {
    resultado.textContent = "Coloca aí um valor válido, por favor 😉";
    return;
  }

  btnConverter.disabled = true;
  btnConverter.textContent = "Convertendo...";

  try {
    const res = await fetch(API_BASE + moedaOrigem.value);
    const dados = await res.json();

    const taxa = dados.rates[moedaDestino.value];
    if (!taxa) {
      resultado.textContent = "Moeda de destino inválida 😕";
      return;
    }

    const convertido = valor * taxa;

    resultado.textContent = `${valor} ${moedaOrigem.value} = ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: moedaDestino.value,
    }).format(convertido)}`;

    infoTaxa.textContent = `1 ${moedaOrigem.value} vale ${taxa.toFixed(
      4
    )} ${moedaDestino.value} (dados de ${dados.date})`;

    adicionaNoHistorico(`${valor} ${moedaOrigem.value} → ${moedaDestino.value} = ${convertido.toFixed(4)}`);
  } catch (e) {
    resultado.textContent = "Ops, algo deu errado na conversão 😬";
  } finally {
    btnConverter.disabled = false;
    btnConverter.textContent = "Converter";
  }
}


carregaAsMoedas();
