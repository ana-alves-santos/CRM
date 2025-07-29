const API_URL = "https://miniature-sniffle-6q7xv7p6jx6c55pw-8080.app.github.dev/clientes";

const form = document.getElementById("formCliente");
const tabela = document.getElementById("tabelaClientes");

class Formatter {
  formatError(selector) {
    this.clearError(selector);
    const el = document.querySelector(selector);
    if (el) el.classList.add("input-error");
  }

  clearError(selector) {
    const el = document.querySelector(selector);
    if (el) el.classList.remove("input-error");
  }

  clearAllErrors() {
    document.querySelectorAll(".input-error").forEach((el) => {
      el.classList.remove("input-error");
    });
  }
}

const formatter = new Formatter();

// Funções de validação
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

function validarTelefone(phone) {
  // Exemplo: (99) 99999-9999 ou (99) 9999-9999
  const re = /^\(\d{2}\) \d{4,5}-\d{4}$/;
  return re.test(phone);
}

function validarCep(cep) {
  // Formato 99999-999
  const re = /^\d{5}-\d{3}$/;
  return re.test(cep);
}

// Carrega clientes e monta tabela
function carregarClientes() {
  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Erro ao carregar clientes: ${res.status}`);
      return res.json();
    })
    .then((clientes) => {
      tabela.innerHTML = "";
      clientes.forEach((cliente) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.name}</td>
          <td>${cliente.adress}</td>
          <td>${cliente.complement}</td>
          <td>${cliente.zipCode}</td>
          <td>${cliente.city}</td>
          <td>${cliente.state}</td>
          <td>${cliente.email}</td>
          <td>${cliente.phone}</td>
          <td><button class="btn-excluir" data-id="${cliente.id}">Excluir</button></td>
        `;
        tabela.appendChild(tr);
      });

      // Evento para excluir cliente
      document.querySelectorAll(".btn-excluir").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          excluirCliente(id);
        });
      });
    })
    .catch((error) => {
      console.error("Falha ao carregar clientes:", error);
    });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  formatter.clearAllErrors();

  const novoCliente = {
    name: document.getElementById("nome").value.trim(),
    adress: document.getElementById("adress").value.trim(),
    complement: document.getElementById("complement").value.trim(),
    zipCode: document.getElementById("zipCode").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };

  let valid = true;

  // Validação nome
  if (!novoCliente.name || novoCliente.name.length < 3) {
    formatter.formatError("#nome");
    valid = false;
  }

  // Validação endereço obrigatório
  if (!novoCliente.adress) {
    formatter.formatError("#adress");
    valid = false;
  }

  // CEP
  if (!validarCep(novoCliente.zipCode)) {
    formatter.formatError("#zipCode");
    valid = false;
  }

  // Cidade obrigatório
  if (!novoCliente.city) {
    formatter.formatError("#city");
    valid = false;
  }

  // Estado obrigatório
  if (!novoCliente.state) {
    formatter.formatError("#state");
    valid = false;
  }

  // Email formato válido
  if (!validarEmail(novoCliente.email)) {
    formatter.formatError("#email");
    valid = false;
  }

  // Telefone formato válido
  if (!validarTelefone(novoCliente.phone)) {
    formatter.formatError("#phone");
    valid = false;
  }

  if (!valid) {
    alert("Por favor, corrija os campos destacados.");
    return;
  }

  // Envia para API
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoCliente),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Erro ao salvar cliente: ${res.status}`);
      return res.json();
    })
    .then(() => {
      form.reset();
      carregarClientes();
    })
    .catch((error) => {
      console.error("Falha ao salvar cliente:", error);
    });
});

// Função para excluir cliente pelo ID
function excluirCliente(id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Erro ao excluir cliente: ${res.status}`);
      carregarClientes();
    })
    .catch((error) => {
      console.error("Falha ao excluir cliente:", error);
    });
}

carregarClientes();
