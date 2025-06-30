// Refatoração: CRUD peças e catálogo via API REST, otimizações de carregamento e renderização

let appState = {
  pecas: [],
  catalogoPecas: [],
  propostasSalvas: [],
  proximoCodigoPeca: 18100,
  proximoCodigoProposta: 22000,
  configuracoes: {
    precoCarbono: '10',
    precoInox: '20',
    precoDobra: '5',
    empresa: 'Alfix Indústria de Estruturas Metálicas LTDA',
    cnpjEmpresa: '34.716.119/0001-87',
    vendedor: '',
    validadeOrcamento: '10',
  }
};

// --- CRUD Peças e Catálogo ---
async function carregarEstado() {
    await Promise.all([carregarPecas(), carregarCatalogo()]);
    renderizarPecas();
    renderizarCatalogoPecas();
    // Se tiver histórico de propostas, chame aqui
    // renderizarHistoricoPropostas();
}

async function carregarPecas() {
    const res = await fetch('/api/pecas');
    appState.pecas = await res.json();
}

async function carregarCatalogo() {
    const res = await fetch('/api/catalogo');
    appState.catalogoPecas = await res.json();
}

async function adicionarPeca() {
    const novaPeca = {
        codigo: appState.proximoCodigoPeca++,
        material: "carbono",
        nome: '',
        metodoCalculo: 'peso',
        largura: '',
        comprimento: '',
        area: '',
        peso: '',
        espessura: '',
        quantidade: 1,
        dobras: 0,
        imagemBase64: null,
        grauDificuldade: 1
    };
    await fetch('/api/pecas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(novaPeca)
    });
    await carregarEstado();
}

async function atualizarPeca(index, propriedade, valor) {
    const peca = {...appState.pecas[index], [propriedade]: valor};
    await fetch(`/api/pecas/${peca.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(peca)
    });
    await carregarEstado();
}

async function atualizarCodigoPeca(index, valor) {
    await atualizarPeca(index, 'codigo', valor);
}

async function removerPeca(index) {
    const peca = appState.pecas[index];
    await fetch(`/api/pecas/${peca.id}`, { method: 'DELETE' });
    await carregarEstado();
}

async function salvarPecaNoCatalogo(index) {
    const peca = appState.pecas[index];
    await fetch('/api/catalogo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(peca)
    });
    await carregarEstado();
}

async function removerPecaCatalogo(id) {
    await fetch(`/api/catalogo/${id}`, { method: 'DELETE' });
    await carregarEstado();
}

async function adicionarPecaDoCatalogo(id) {
    const peca = appState.catalogoPecas.find(p => p.id === id);
    if (!peca) return;
    const {id: _, ...novaPeca} = peca;
    await fetch('/api/pecas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(novaPeca)
    });
    await carregarEstado();
}

// --- Renderização do Catálogo ---
function renderizarCatalogoPecas() {
    const container = document.getElementById('catalogo-table-container');
    if (!container) return;
    let html = `<table class="catalogo-table">
        <thead>
            <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Material</th>
                <th>Grau</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>`;
    appState.catalogoPecas.forEach(peca => {
        html += `<tr>
            <td>${peca.codigo}</td>
            <td>${peca.nome}</td>
            <td>${peca.material}</td>
            <td>${peca.grauDificuldade || 1}</td>
            <td>
                <button onclick="adicionarPecaDoCatalogo(${peca.id})" title="Adicionar ao Orçamento">+</button>
                <button onclick="removerPecaCatalogo(${peca.id})" title="Remover do Catálogo">🗑️</button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// --- Renderização das Peças ---
function renderizarPecas() {
    const listaPecasEl = document.getElementById("listaPecas");
    listaPecasEl.innerHTML = "";

    appState.pecas.forEach((peca, index) => {
        const div = document.createElement("div");
        div.classList.add("peca-card");
        div.innerHTML = `
            <div class="peca-card-header">
                <label class="codigo-peca-label">Código: 
                    <input type="number" class="codigo-peca-input" value="${peca.codigo}" onchange="atualizarCodigoPeca(${index}, this.value)">
                </label>
                <div class="peca-card-actions">
                    <button class="btn-salvar-peca" onclick="salvarPecaNoCatalogo(${index})" title="Salvar Peça no Catálogo">💾</button>
                    <button class="btn-remover" onclick="removerPeca(${index})" title="Remover Peça">🗑️</button>
                </div>
            </div>
            <div class="peca-card-body">
                <div class="peca-card-inputs">
                    <div class="peca-card-row"> 
                        <label class="label-nome"><span>Nome:</span> <input type="text" value="${peca.nome || ''}" onchange="atualizarPeca(${index}, 'nome', this.value)" placeholder="Nome da Peça"></label>
                        <label><span>Material:</span> <select onchange="atualizarPeca(${index}, 'material', this.value)">
                            <option value="carbono" ${peca.material === 'carbono' ? 'selected' : ''}>Aço Carbono</option>
                            <option value="inox" ${peca.material === 'inox' ? 'selected' : ''}>Aço Inox</option>
                        </select></label>
                        <label>Grau de Dificuldade:
                            <select class="grau-dificuldade-select" onchange="atualizarPeca(${index}, 'grauDificuldade', Number(this.value))">
                                <option value="1" ${peca.grauDificuldade == 1 ? 'selected' : ''}>Normal</option>
                                <option value="2" ${peca.grauDificuldade == 2 ? 'selected' : ''}>Difícil (1,25x)</option>
                                <option value="3" ${peca.grauDificuldade == 3 ? 'selected' : ''}>Muito Difícil (1,5x)</option>
                            </select>
                        </label>
                        <label>Modo de Cálculo:
                            <select onchange="atualizarPeca(${index}, 'metodoCalculo', this.value)">
                                <option value="area_quadrada" ${peca.metodoCalculo === 'area_quadrada' ? 'selected' : ''}>Área Quadrada</option>
                                <option value="area_total" ${peca.metodoCalculo === 'area_total' ? 'selected' : ''}>Área Total</option>
                                <option value="peso" ${peca.metodoCalculo === 'peso' ? 'selected' : ''}>Peso Informado</option>
                            </select>
                        </label>
                    </div>
                    <div class="peca-card-row metodo-${peca.metodoCalculo}">
                        <label><span>Dobras:</span> <input type="number" value="${peca.dobras || 0}" onchange="atualizarPeca(${index}, 'dobras', parseInt(this.value) || 0)"></label>
                        <label><span>Quantidade:</span> <input type="number" value="${peca.quantidade || 1}" onchange="atualizarPeca(${index}, 'quantidade', parseInt(this.value) || 1)"></label>
                        <label class="medida-label input-largura"><span>Largura (mm):</span> <input type="number" value="${peca.largura || ''}" onchange="atualizarPeca(${index}, 'largura', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-comprimento"><span>Comprimento (mm):</span> <input type="number" value="${peca.comprimento || ''}" onchange="atualizarPeca(${index}, 'comprimento', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-espessura"><span>Espessura (mm):</span> <input type="number" value="${peca.espessura || ''}" onchange="atualizarPeca(${index}, 'espessura', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-area"><span>Área (mm²):</span> <input type="number" value="${peca.area || ''}" onchange="atualizarPeca(${index}, 'area', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-peso"><span>Peso Unit.(kg):</span> <input type="number" value="${peca.peso || ''}" onchange="atualizarPeca(${index}, 'peso', parseFloat(this.value) || 0)"></label>
                    </div>
                </div>
            </div>
        `;
        listaPecasEl.appendChild(div);
    });
}

// --- Funções auxiliares e de interface permanecem iguais ---

window.onload = async function() {
    // Se tiver função de desconto, chame aqui
    // atualizarDesconto();
    await carregarEstado();
};
