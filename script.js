const ctx = document.getElementById('grafico').getContext('2d');
const listaMoedasEl = document.getElementById('coinList');
const filtroMoedas = document.getElementById('searchInput');

let graficoLinha;
let dadosMercado = [];

async function obterDadosMercado() {
  if (dadosMercado.length) return dadosMercado;

  try {
    const resposta = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h');
    if (!resposta.ok) throw new Error('Erro ao buscar dados do mercado');
    dadosMercado = await resposta.json();
    return dadosMercado;
  } catch (erro) {
    console.error(erro);
    return [];
  }
}

async function obterDadosHistoricos(idMoeda) {
  try {
    const resposta = await fetch(`https://api.coingecko.com/api/v3/coins/${idMoeda}/market_chart?vs_currency=usd&days=7&interval=daily`);
    if (!resposta.ok) throw new Error('Erro ao buscar dados');
    return await resposta.json();
  } catch (erro) {
    console.error(erro);
    return null;
  }
}

function formatarUSD(valor) {
  return `$${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function atualizarListaMoedas(dados, filtro = '') {
  listaMoedasEl.innerHTML = '';
  const filtrados = dados.filter(({ name, symbol }) =>
    name.toLowerCase().includes(filtro.toLowerCase()) || symbol.toLowerCase().includes(filtro.toLowerCase())
  );

  filtrados.forEach(({ id, symbol, name, current_price }) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${symbol.toUpperCase()} - ${name}</span> <span>${formatarUSD(current_price)}</span>`;
    li.addEventListener('click', () => carregarGrafico(id, symbol.toUpperCase()));
    listaMoedasEl.appendChild(li);
  });
}

async function carregarGrafico(idMoeda, simboloMoeda) {
  const dadosHistoricos = await obterDadosHistoricos(idMoeda);
  if (!dadosHistoricos) return;

  const labels = dadosHistoricos.prices.map(([timestamp]) => {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  });

  const precos = dadosHistoricos.prices.map(([, preco]) => preco);

  if (graficoLinha) {
    graficoLinha.data.labels = labels;
    graficoLinha.data.datasets[0].data = precos;
    graficoLinha.data.datasets[0].label = `${simboloMoeda} (USD)`;
    graficoLinha.update();
  } else {
    graficoLinha = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${simboloMoeda} (USD)`,
          data: precos,
          borderColor: '#4f6ef7',
          backgroundColor: 'rgba(79,110,247,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#f5f6fa' } }
        },
        scales: {
          x: { ticks: { color: '#a4a7b7' }, grid: { color: '#2f3249' } },
          y: { ticks: { color: '#a4a7b7' }, grid: { color: '#2f3249' } }
        }
      }
    });
  }
}

async function iniciar() {
  const dados = await obterDadosMercado();
  if (!dados.length) {
    listaMoedasEl.innerHTML = '<li>Não foi possível carregar dados.</li>';
    return;
  }

  atualizarListaMoedas(dados);
  carregarGrafico(dados[0].id, dados[0].symbol.toUpperCase());
}

let tempoDebounce;
filtroMoedas.addEventListener('input', e => {
  clearTimeout(tempoDebounce);
  tempoDebounce = setTimeout(() => {
    atualizarListaMoedas(dadosMercado, e.target.value);
  }, 300);
});

iniciar();
