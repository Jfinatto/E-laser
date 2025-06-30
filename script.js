// script.js - Versão revisada para evitar bugs

// Estado centralizado da aplicação
let appState = {
  pecas: [],
  catalogoPecas: {},
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

// Variável global para rastrear qual card de peça abriu o modal de busca
let indicePecaAlvo = null;
let descontoPercentual = 0;

function mostrarTela(id) {
    const telaPecas = document.getElementById('pecas');
    const telaConfig = document.getElementById('config');
    const headerTitle = document.getElementById('header-title');
    const logo = document.getElementById('logo-img');

    if (id === 'pecas') {
        telaPecas.style.display = 'block';
        telaConfig.style.display = 'none';
        headerTitle.style.display = 'block';
        if (logo) logo.style.display = 'block';
    } else {
        telaPecas.style.display = 'none';
        telaConfig.style.display = 'block';
        headerTitle.style.display = 'none';
        if (logo) logo.style.display = 'none';
    }
}

function mostrarConfigTab(tabId, element) {
    // Esconde todos os conteúdos das abas
    document.querySelectorAll('.config-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    // Remove a classe 'active' de todos os botões
    document.querySelectorAll('.config-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Mostra a aba selecionada e ativa o botão
    document.getElementById(`config-${tabId}`).style.display = 'block';
    if (element) {
        element.classList.add('active');
    }
}

function carregarImagem(event, index) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        appState.pecas[index].imagemBase64 = e.target.result;
        salvarEstado();
        renderizarPecas();
    };
    reader.readAsDataURL(file);
}

function renderizarPecas() {
    const listaPecasEl = document.getElementById("listaPecas");
    listaPecasEl.innerHTML = "";

    appState.pecas.forEach((peca, index) => {
        const div = document.createElement("div");
        div.classList.add("peca-card");

        // **INÍCIO DA MUDANÇA ESTRUTURAL**
        div.innerHTML = `
            <div class="peca-card-header">
                <label class="codigo-peca-label">Código: 
                    <input type="number" class="codigo-peca-input" value="${peca.codigo}" onchange="atualizarCodigoPeca(${index}, this.value)">
                    <button class="btn-busca-peca" onclick="abrirModalBuscaPeca(${index})" title="Buscar Peça no Catálogo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </label>
                <div class="peca-card-actions">
                    <button class="btn-salvar-peca" onclick="salvarPecaNoCatalogo(${index})" title="Salvar Peça no Catálogo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    </button>
                    <button class="btn-remover" onclick="removerPeca(${index})" title="Remover Peça">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
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
                            <select class="grau-dificuldade-select" onchange="atualizarGrauDificuldade(this, ${index})">
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
                        
                        <!-- Medidas agora são irmãos diretos dos outros campos para alinhamento e visibilidade corretos -->
                        <label class="medida-label input-largura"><span>Largura (mm):</span> <input type="number" value="${peca.largura || ''}" onchange="atualizarPeca(${index}, 'largura', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-comprimento"><span>Comprimento (mm):</span> <input type="number" value="${peca.comprimento || ''}" onchange="atualizarPeca(${index}, 'comprimento', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-espessura"><span>Espessura (mm):</span> <input type="number" value="${peca.espessura || ''}" onchange="atualizarPeca(${index}, 'espessura', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-area"><span>Área (mm²):</span> <input type="number" value="${peca.area || ''}" onchange="atualizarPeca(${index}, 'area', parseFloat(this.value) || 0)"></label>
                        <label class="medida-label input-peso"><span>Peso Unit.(kg):</span> <input type="number" value="${peca.peso || ''}" onchange="atualizarPeca(${index}, 'peso', parseFloat(this.value) || 0)"></label>
                    </div>
                </div>
                <div class="upload-container">
                    ${peca.imagemBase64 ? `
                        <div class="preview-container">
                            <img src="${peca.imagemBase64}" alt="Preview" class="preview-img">
                            <button class="btn-remover-img" onclick="removerImagem(${index})" title="Remover Imagem">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ` : ''}
                    <label for="upload-${index}" class="upload-label" title="Carregar Imagem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </label>
                    <input id="upload-${index}" type="file" accept="image/*" onchange="carregarImagem(event, ${index})">
                </div>
            </div>
        `;
        // **FIM DA MUDANÇA ESTRUTURAL**
        listaPecasEl.appendChild(div);
    });
}

function atualizarPeca(index, propriedade, valor) {
    appState.pecas[index][propriedade] = valor;
    salvarEstado();
    calcularOrcamento();
    renderizarPecas();
}

function atualizarCodigoPeca(index, novoCodigoStr) {
    const novoCodigo = parseInt(novoCodigoStr);
    const pecaAtual = appState.pecas[index];

    if (isNaN(novoCodigo) || novoCodigo <= 0) {
        alert("O código da peça deve ser um número válido e positivo.");
        renderizarPecas(); // Re-render to restore the old value
        return;
    }

    const isDuplicateInProposal = appState.pecas.some((p, i) => i !== index && p.codigo === novoCodigo);
    if (isDuplicateInProposal) {
        alert(`O código ${novoCodigo} já está em uso por outra peça NESTE orçamento. Por favor, escolha um código único para este orçamento.`);
        renderizarPecas();
        return;
    }

    const pecaDoCatalogo = appState.catalogoPecas[novoCodigo];
    if (pecaDoCatalogo) {
        const confirmar = confirm(
            `O código ${novoCodigo} já existe no catálogo (Peça: "${pecaDoCatalogo.nome || 'sem nome'}").\n\nDeseja carregar os dados do catálogo para esta peça?`
        );

        if (confirmar) {
            pecaAtual.nome = pecaDoCatalogo.nome;
            pecaAtual.material = pecaDoCatalogo.material;
            pecaAtual.metodoCalculo = pecaDoCatalogo.metodoCalculo;
            pecaAtual.largura = pecaDoCatalogo.largura;
            pecaAtual.comprimento = pecaDoCatalogo.comprimento;
            pecaAtual.area = pecaDoCatalogo.area;
            pecaAtual.peso = pecaDoCatalogo.peso;
            pecaAtual.espessura = pecaDoCatalogo.espessura;
            pecaAtual.dobras = pecaDoCatalogo.dobras;
        }
    }

    pecaAtual.codigo = novoCodigo;
    atualizarProximoCodigoPeca();
    salvarEstado();
    renderizarPecas();
}

function salvarPecaNoCatalogo(index) {
    const peca = appState.pecas[index];
    if (!peca || !peca.codigo) {
        alert("A peça precisa de um código válido para ser salva no catálogo.");
        return;
    }

    appState.catalogoPecas[peca.codigo] = {
        nome: peca.nome || '',
        material: peca.material,
        metodoCalculo: peca.metodoCalculo,
        largura: peca.largura || 0,
        comprimento: peca.comprimento || 0,
        area: peca.area || 0,
        peso: peca.peso || 0,
        espessura: peca.espessura || 0,
        dobras: peca.dobras || 0
    };

    salvarEstado();
    renderizarCatalogoPecas();
    alert(`Peça ${peca.codigo} - "${peca.nome || 'Sem nome'}" foi salva/atualizada no catálogo!`);
}

function atualizarProximoCodigoPeca() {
    const codigos = appState.pecas.map(p => p.codigo);
    for (const key in appState.catalogoPecas) {
        codigos.push(parseInt(key));
    }

    if (codigos.length === 0) {
        appState.proximoCodigoPeca = 18100;
    } else {
        appState.proximoCodigoPeca = Math.max(18100, ...codigos.filter(c => !isNaN(c))) + 1;
    }
}

function adicionarPeca() {
    appState.pecas.push({
        codigo: appState.proximoCodigoPeca,
        material: "carbono",
        nome: '',
        metodoCalculo: 'peso', // Nova peça começa no modo 'peso'
        largura: '',
        comprimento: '',
        area: '',
        peso: '',
        espessura: '',
        quantidade: 1,
        dobras: 0,
        imagemBase64: null,
        grauDificuldade: 1
    });
    atualizarProximoCodigoPeca();
    salvarEstado();
    renderizarPecas();
}

function removerImagem(index) {
    appState.pecas[index].imagemBase64 = null;
    salvarEstado();
    renderizarPecas();
}

function removerPeca(index) {
    appState.pecas.splice(index, 1);
    atualizarProximoCodigoPeca();
    salvarEstado();
    renderizarPecas();
}

function formatarMoeda(valor) {
    valor = Number(valor) || 0;
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function atualizarDesconto() {
  const input = document.getElementById('descontoPercentual');
  let valor = parseFloat(input.value) || 0;
  if (valor > 15) valor = 15;
  if (valor < 0) valor = 0;
  input.value = valor;
  descontoPercentual = valor;
}

// Chame atualizarDesconto() ao carregar a página para garantir valor inicial
window.onload = function() {
  atualizarDesconto();
  carregarEstado();
};

function calcularOrcamento() {
    const precoCarbono = parseFloat(document.getElementById("precoCarbono").value) || 0;
    const precoInox = parseFloat(document.getElementById("precoInox").value) || 0;
    const precoDobra = parseFloat(document.getElementById("precoDobra").value) || 0;

    const densidadeCarbono = 0.00000785; // kg/mm³
    const densidadeInox = 0.000008; // kg/mm³

    let totalGeral = 0;
    let pesoTotalPedido = 0;
    let resultadosHTML = `<h4>Resumo do Cálculo</h4>`;

    appState.pecas.forEach(p => {
        const largura = parseFloat(p.largura) || 0;
        const comprimento = parseFloat(p.comprimento) || 0;
        const area = parseFloat(p.area) || 0;
        const espessura = parseFloat(p.espessura) || 0;
        const pesoInformado = parseFloat(p.peso) || 0;
        const dobras = parseInt(p.dobras) || 0;
        const quantidade = parseInt(p.quantidade) || 1;

        const precoKg = p.material === "inox" ? precoInox : precoCarbono;
        const densidade = p.material === "inox" ? densidadeInox : densidadeCarbono;

        let pesoCalculado = 0;
        let metodoUsado = "";

        switch (p.metodoCalculo) {
            case 'area_quadrada':
                pesoCalculado = largura * comprimento * espessura * densidade;
                metodoUsado = "Área Quadrada";
                break;
            case 'area_total':
                pesoCalculado = area * espessura * densidade;
                metodoUsado = "Área Total";
                break;
            case 'peso':
                pesoCalculado = pesoInformado;
                metodoUsado = "Peso";
                break;
            default:
                pesoCalculado = 0;
                metodoUsado = "Método Inválido";
        }

        p.pesoCalculado = parseFloat(pesoCalculado.toFixed(3));

        const custoMaterial = p.pesoCalculado * precoKg;
        const custoDobras = dobras * precoDobra;
        let precoUnit = custoMaterial + custoDobras;

        // --- APLICA O MULTIPLICADOR DO GRAU DE DIFICULDADE ---
        let multiplicador = 1;
        if (p.grauDificuldade === 2) multiplicador = 1.25;
        if (p.grauDificuldade === 3) multiplicador = 1.5;
        precoUnit *= multiplicador;

        const precoTotal = precoUnit * quantidade;

        totalGeral += precoTotal;
        pesoTotalPedido += p.pesoCalculado * quantidade;

        p.precoUnitario = precoUnit;
        p.precoTotal = precoTotal;

        resultadosHTML += `<p><b>${p.codigo} - ${p.nome || 'Sem nome'}</b>: [${metodoUsado}] ${p.pesoCalculado} kg/un | ${formatarMoeda(precoUnit)}/un x ${quantidade} un = <b>${formatarMoeda(precoTotal)}</b></p>`;
    });

    let valorTotal = totalGeral;
    let valorComDesconto = totalGeral;

    if (descontoPercentual > 0) {
        valorComDesconto = totalGeral * (1 - descontoPercentual / 100);
    }

    resultadosHTML += `<hr>
        <div class="resultados-finais">
            <h3><strong>Peso Total do Pedido: ${pesoTotalPedido.toFixed(3)} kg</strong></h3>
            <h3><strong>Total Geral: ${formatarMoeda(totalGeral)}</strong></h3>
        </div>`;

    document.getElementById("resultados").innerHTML = resultadosHTML;

    // Salve para uso no PDF
    window.valorTotalOrcamento = valorTotal;
    window.valorComDescontoOrcamento = valorComDesconto;
    window.descontoPercentualOrcamento = descontoPercentual;
}

const jsPDF = window.jspdf.jsPDF;

function _criarDocumentoPDF(dados) {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(13, 90, 153);
    doc.setFont("helvetica", "bold");
    doc.text(`PROPOSTA COMERCIAL: ${dados.numeroProposta}`, 200, 20, null, null, "right");
    doc.setLineWidth(0.5);
    doc.setDrawColor(243, 108, 33);
    doc.line(10, 25, 200, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Empresa: ${dados.empresa}`, 14, 35);
    doc.text(`CNPJ: ${dados.cnpjEmpresa}`, 14, 40);
    doc.text(`Vendedor: ${dados.vendedor}`, 14, 45);
    doc.text(`Data de Emissão: ${dados.dataEmissao}`, 14, 50);

    const tableColumn = ["Imagem", "Código", "Descrição", "Qtd.", "Peso (kg)", "V. Unit. (R$)", "Subtotal (R$)"];
    const tableRows = dados.pecas.map(p => [
        "",
        p.codigo || "-",
        p.nome || "Peça sem nome",
        p.quantidade || 1,
        (p.pesoCalculado || 0).toFixed(3).replace('.', ','),
        (p.precoUnitario || 0).toFixed(2).replace('.', ','),
        (p.precoTotal || 0).toFixed(2).replace('.', ',')
    ]);

    // Rodapé da tabela com valor total e desconto (apenas aqui!)
    const tableFooter = [
        [
            {
                content: 'PESO TOTAL DO ORÇAMENTO:',
                colSpan: 6,
                styles: { halign: 'right', fontStyle: 'bold' }
            },
            {
                content: `${(dados.pesoTotalPedido || 0).toFixed(3).replace('.',',')} kg`,
                colSpan: 1,
                styles: { halign: 'right', fontStyle: 'bold', overflow: 'hidden' }
            }
        ],
        [
            {
                content: dados.descontoPercentual > 0
                    ? 'VALOR TOTAL:'
                    : 'VALOR TOTAL DO ORÇAMENTO:',
                colSpan: 6,
                styles: { halign: 'right', fontStyle: 'bold' }
            },
            {
                content: formatarMoeda(dados.totalGeral),
                colSpan: 1,
                styles: {
                    halign: 'right',
                    fontStyle: 'bold', // Sempre negrito
                    textColor: [0,0,0],
                    overflow: 'hidden',
                    decoration: dados.descontoPercentual > 0 ? 'lineThrough' : undefined
                }
            }
        ]
    ];

    if (dados.descontoPercentual > 0) {
        // Garante que o valor com desconto seja calculado corretamente
        const valorComDesconto = typeof dados.valorComDesconto === 'number'
            ? dados.valorComDesconto
            : (typeof dados.totalGeral === 'number'
                ? dados.totalGeral * (1 - dados.descontoPercentual / 100)
                : 0);

        tableFooter.push([
            {
                content: `VALOR COM DESCONTO (${dados.descontoPercentual}%):`,
                colSpan: 6,
                styles: { halign: 'right', fontStyle: 'bold' }
            },
            {
                content: formatarMoeda(valorComDesconto),
                colSpan: 1,
                styles: { halign: 'right', fontStyle: 'bold', textColor: [0,0,0], overflow: 'hidden' }
            }
        ]);
    }

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        foot: tableFooter,
        startY: 58,
        headStyles: {
            fillColor: [13, 90, 153]
        },
        footStyles: {
            fillColor: [232, 232, 232],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        bodyStyles: {
            minCellHeight: 18
        },
        styles: {
            halign: 'center',
            font: 'helvetica',
            valign: 'middle',
            cellPadding: 2
        },
        columnStyles: {
            0: {
                minCellWidth: 20
            },
            2: {
                halign: 'left'
            },
            3: {
                halign: 'center'
            },
            4: {
                halign: 'right'
            },
            5: {
                halign: 'right'
            },
            6: {
                halign: 'right'
            }
        },
        didDrawPage: function(data) {
            data.table.body.forEach((row, rowIndex) => {
                const peca = dados.pecas[rowIndex];
                if (peca && peca.imagemBase64) {
                    const cell = row.cells[0];
                    const imgWidth = 15;
                    const imgHeight = 15;
                    const x = cell.x + (cell.width - imgWidth) / 2;
                    const y = cell.y + (cell.height - imgHeight) / 2;
                    doc.addImage(peca.imagemBase64, 'PNG', x, y, imgWidth, imgHeight);
                }
            });
        }
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const finalFooterY = pageHeight - 15;
    doc.line(40, finalFooterY - 15, 170, finalFooterY - 15);
    doc.text("Assinatura do Cliente", 105, finalFooterY - 10, null, null, "center");
    doc.text(`${dados.cliente}`, 105, finalFooterY - 5, null, null, "center");
    doc.text(`CPF/CNPJ: ${dados.cpfCnpjCliente}`, 105, finalFooterY, null, null, "center");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Esta proposta é válida até: ${dados.dataValidadeStr}`, 105, pageHeight - 5, null, null, "center");

    doc.save(`Web-Laser_Orcamento_${dados.numeroProposta}_${dados.cliente.replace(/[\s\/]/g, '_') || 'Proposta'}.pdf`);
}

function gerarPDFHistorico(numeroProposta) {
    const proposta = appState.propostasSalvas.find(p => p.numeroProposta === numeroProposta);
    if (proposta) {
        _criarDocumentoPDF(proposta);
    } else {
        alert(`Proposta com número ${numeroProposta} não encontrada no histórico.`);
    }
}

function abrirModalRevisaoPDF() {
    calcularOrcamento();
    if (appState.pecas.length === 0) {
        alert("Adicione pelo menos uma peça ao orçamento antes de gerar o PDF.");
        return;
    }

    document.getElementById('revisaoEmpresa').value = document.getElementById('empresa').value;
    document.getElementById('revisaoCnpjEmpresa').value = document.getElementById('cnpjEmpresa').value;
    document.getElementById('revisaoVendedor').value = document.getElementById('vendedor').value;
    document.getElementById('revisaoCliente').value = document.getElementById('cliente').value;
    document.getElementById('revisaoCpfCnpjCliente').value = document.getElementById('cpfCnpjCliente').value;
    document.getElementById('revisaoNumeroProposta').value = document.getElementById('numeroProposta').value;
    document.getElementById('revisaoValidadeOrcamento').value = document.getElementById('validadeOrcamento').value;
    // Preencher desconto do modal com o valor atual das configurações
    document.getElementById('revisaoDescontoPercentual').value = document.getElementById('descontoPercentual').value || 0;
    document.getElementById('modalRevisaoPDF').style.display = 'block';
}

function fecharModalRevisaoPDF() {
    document.getElementById('modalRevisaoPDF').style.display = 'none';
}

function confirmarEGerarPDF() {
    try {
        const validadeDias = parseInt(document.getElementById("revisaoValidadeOrcamento").value) || 10;
        const numeroPropostaInput = document.getElementById("revisaoNumeroProposta");
        const numeroProposta = numeroPropostaInput.value;

        if (!numeroProposta || parseInt(numeroProposta) <= 0) {
            alert("O número da proposta é obrigatório e deve ser um número positivo.");
            numeroPropostaInput.focus();
            return;
        }

        if (appState.propostasSalvas.find(p => p.numeroProposta === numeroProposta)) {
            alert(`O número de proposta ${numeroProposta} já foi utilizado. Por favor, use um número diferente.`);
            numeroPropostaInput.focus();
            return;
        }

        const hoje = new Date();
        const dataValidade = new Date();
        dataValidade.setDate(hoje.getDate() + validadeDias);

        const descontoPercentual = Math.min(
            15,
            Math.max(0, parseFloat(document.getElementById('revisaoDescontoPercentual').value) || 0)
        );
        window.descontoPercentualOrcamento = descontoPercentual;

        // Calcule o valor total e com desconto
        const valorTotal = window.valorTotalOrcamento || 0;
        const valorComDesconto = descontoPercentual > 0
            ? valorTotal * (1 - descontoPercentual / 100)
            : valorTotal;
        window.valorComDescontoOrcamento = valorComDesconto;

        const propostaAtual = {
            numeroProposta: numeroProposta,
            empresa: document.getElementById("revisaoEmpresa").value || "Empresa",
            cnpjEmpresa: document.getElementById("revisaoCnpjEmpresa").value || "",
            vendedor: document.getElementById("revisaoVendedor").value || "Não informado",
            cliente: document.getElementById("revisaoCliente").value || "Não informado",
            cpfCnpjCliente: document.getElementById("revisaoCpfCnpjCliente").value || "",
            dataEmissao: hoje.toLocaleDateString("pt-BR"),
            dataValidadeStr: dataValidade.toLocaleDateString("pt-BR"),
            descontoPercentual: descontoPercentual,
            pecas: JSON.parse(JSON.stringify(appState.pecas)),
            totalGeral: appState.pecas.reduce((acc, p) => acc + (p.precoTotal || 0), 0),
            pesoTotalPedido: appState.pecas.reduce((acc, p) => acc + (p.pesoCalculado || 0) * p.quantidade, 0)
        };

        _criarDocumentoPDF(propostaAtual);
        appState.propostasSalvas.push(propostaAtual);
        renderizarHistoricoPropostas();
        appState.proximoCodigoProposta = parseInt(numeroProposta) + 1;
        document.getElementById('numeroProposta').value = appState.proximoCodigoProposta;
        salvarEstado();
        fecharModalRevisaoPDF();
    } catch (error) {
        console.error("Ocorreu um erro ao gerar o PDF:", error);
        alert("Não foi possível gerar o PDF. Verifique o console de desenvolvedor (F12) para mais detalhes.");
    }
}

function atualizarGrauDificuldade(select, indice) {
    const grau = Number(select.value);
    appState.pecas[indice].grauDificuldade = grau;
    calcularOrcamento();
}

// Ao adicionar uma nova peça:
function adicionarPeca() {
    appState.pecas.push({
        codigo: appState.proximoCodigoPeca,
        material: "carbono",
        nome: '',
        metodoCalculo: 'peso', // Nova peça começa no modo 'peso'
        largura: '',
        comprimento: '',
        area: '',
        peso: '',
        espessura: '',
        quantidade: 1,
        dobras: 0,
        imagemBase64: null,
        grauDificuldade: 1
    });
    atualizarProximoCodigoPeca();
    salvarEstado();
    renderizarPecas();
}

// Ao calcular o preço unitário:
function calcularPrecoPeca(peca, precoKg, precoDobra) {
    // Calcula o custo base da peça
    const custoMaterial = (peca.pesoCalculado || 0) * (precoKg || 0);
    const custoDobras = (peca.dobras || 0) * (precoDobra || 0);
    let precoUnitario = custoMaterial + custoDobras;

    // Aplica o multiplicador do grau de dificuldade
    let multiplicador = 1;
    if (peca.grauDificuldade === 2) multiplicador = 1.25;
    if (peca.grauDificuldade === 3) multiplicador = 1.5;
    precoUnitario *= multiplicador;

    return precoUnitario;
}

function salvarEstado() {
    appState.configuracoes.precoCarbono = document.getElementById('precoCarbono').value;
    appState.configuracoes.precoInox = document.getElementById('precoInox').value;
    appState.configuracoes.precoDobra = document.getElementById('precoDobra').value;
    appState.configuracoes.empresa = document.getElementById('empresa').value;
    appState.configuracoes.cnpjEmpresa = document.getElementById('cnpjEmpresa').value;
    appState.configuracoes.vendedor = document.getElementById('vendedor').value;
    appState.configuracoes.validadeOrcamento = document.getElementById('validadeOrcamento').value;
    localStorage.setItem('orcamentoAppState', JSON.stringify(appState));
}

function carregarEstado() {
    const estadoSalvo = localStorage.getItem('orcamentoAppState');
    if (estadoSalvo) {
        const estadoCarregado = JSON.parse(estadoSalvo);
        appState = {
            ...appState,
            ...estadoCarregado,
            configuracoes: { ...appState.configuracoes,
                ...(estadoCarregado.configuracoes || {})
            },
            pecas: estadoCarregado.pecas || [],
            catalogoPecas: estadoCarregado.catalogoPecas || {},
            propostasSalvas: estadoCarregado.propostasSalvas || []
        };
    }
    const config = appState.configuracoes;
    document.getElementById('precoCarbono').value = config.precoCarbono;
    document.getElementById('precoInox').value = config.precoInox;
    document.getElementById('precoDobra').value = config.precoDobra;
    document.getElementById('empresa').value = config.empresa;
    document.getElementById('cnpjEmpresa').value = config.cnpjEmpresa;
    document.getElementById('vendedor').value = config.vendedor;
    document.getElementById('validadeOrcamento').value = config.validadeOrcamento;
    document.getElementById('numeroProposta').value = appState.proximoCodigoProposta;
    atualizarProximoCodigoPeca();
    renderizarPecas();
    renderizarCatalogoPecas();
    renderizarHistoricoPropostas();
}

function renderizarCatalogoPecas() {
    const container = document.getElementById('catalogo-table-container');
    const catalogo = appState.catalogoPecas;
    if (Object.keys(catalogo).length === 0) {
        container.innerHTML = '<p>Nenhuma peça no catálogo. Salve peças do orçamento para adicioná-las aqui.</p>';
        return;
    }

    let tableHTML = `
        <table class="styled-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Material</th>
                    <th>Método de cálculo</th>
                    <th>Detalhes</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    for (const codigo in catalogo) {
        const peca = catalogo[codigo];
        let detalhes = '';
        switch (peca.metodoCalculo) {
            case 'area_quadrada':
                detalhes = `${peca.largura || 0}x${peca.comprimento || 0}x${peca.espessura || 0}mm`;
                break;
            case 'area_total':
                detalhes = `${peca.area || 0}mm² x ${peca.espessura || 0}mm`;
                break;
            case 'peso':
                detalhes = `${peca.peso || 0}kg`;
                break;
            default:
                detalhes = 'N/A';
        }
        tableHTML += `
            <tr>
                <td>${codigo}</td>
                <td>${peca.nome || 'N/A'}</td>
                <td>${peca.material}</td>
                <td style="text-transform: capitalize;">${(peca.metodoCalculo || 'N/A').replace('_', ' ')}</td>
                <td>${detalhes}</td>
                <td>
                    <button class="btn-remover-small" onclick="removerPecaDoCatalogo('${codigo}')" title="Remover do Catálogo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            </tr>
        `;
    }
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

function removerPecaDoCatalogo(codigo) {
    if (confirm(`Tem certeza que deseja remover a peça com código ${codigo} do catálogo?`)) {
        delete appState.catalogoPecas[codigo];
        salvarEstado();
        renderizarCatalogoPecas();
        alert(`Peça ${codigo} removida do catálogo.`);
    }
}

function renderizarHistoricoPropostas() {
    const container = document.getElementById('historico-table-container');
    const historico = appState.propostasSalvas;
    if (historico.length === 0) {
        container.innerHTML = '<p>Nenhuma proposta no histórico. Gere um PDF para salvar uma proposta aqui.</p>';
        return;
    }

    let tableHTML = `
        <table class="styled-table">
            <thead><tr><th>Nº Proposta</th><th>Cliente</th><th>Data</th><th>Valor Total</th><th>Ações</th></tr></thead>
            <tbody>
    `;
    historico.slice().reverse().forEach(proposta => {
        tableHTML += `
            <tr>
                <td>${proposta.numeroProposta}</td>
                <td>${proposta.cliente}</td>
                <td>${proposta.dataEmissao}</td>
                <td>${formatarMoeda(proposta.totalGeral)}</td>
                <td>
                    <button class="btn-remover-small" onclick="removerProposta('${proposta.numeroProposta}')" title="Remover Proposta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <button class="btn-gerar-pdf-small" onclick="gerarPDFHistorico('${proposta.numeroProposta}')" title="Gerar PDF Novamente">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

function removerProposta(numeroProposta) {
    if (confirm(`Tem certeza que deseja remover a proposta ${numeroProposta} do histórico?`)) {
        appState.propostasSalvas = appState.propostasSalvas.filter(p => p.numeroProposta !== numeroProposta);
        salvarEstado();
        renderizarHistoricoPropostas();
        alert(`Proposta ${numeroProposta} removida do histórico.`);
    }
}

function abrirModalBuscaPeca(index) {
    indicePecaAlvo = index;
    document.getElementById('modalBuscaPeca').style.display = 'flex';
    document.getElementById('buscaPecaInput').value = '';
    document.getElementById('buscaPecaInput').focus();
    filtrarCatalogo();
}

function fecharModalBuscaPeca() {
    document.getElementById('modalBuscaPeca').style.display = 'none';
    indicePecaAlvo = null;
}

function filtrarCatalogo() {
    const termo = document.getElementById('buscaPecaInput').value.toLowerCase();
    const listaEl = document.getElementById('listaBuscaPecas');
    const catalogo = appState.catalogoPecas;

    const filteredCodes = Object.keys(catalogo).filter(codigo => {
        const peca = catalogo[codigo];
        return codigo.includes(termo) || (peca.nome && peca.nome.toLowerCase().includes(termo));
    });

    if (filteredCodes.length === 0) {
        listaEl.innerHTML = '<p>Nenhuma peça encontrada.</p>';
        return;
    }

    let tableHTML = `
        <table class="styled-table search-results-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    filteredCodes.forEach(codigo => {
        const peca = catalogo[codigo];
        tableHTML += `
            <tr onclick="selecionarPecaDoCatalogo('${codigo}')">
                <td>${codigo}</td>
                <td>${peca.nome || 'Sem nome'}</td>
                <td>
                    <button class="btn-select-small" title="Selecionar Peça">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </td>
            </tr>
        `;
    });
    tableHTML += '</tbody></table>';
    listaEl.innerHTML = tableHTML;
}

function selecionarPecaDoCatalogo(codigo) {
    const pecaDoCatalogo = appState.catalogoPecas[codigo];
    if (pecaDoCatalogo && indicePecaAlvo !== null) {
        const pecaAtual = appState.pecas[indicePecaAlvo];
        pecaAtual.codigo = parseInt(codigo);
        pecaAtual.nome = pecaDoCatalogo.nome;
        pecaAtual.material = pecaDoCatalogo.material;
        pecaAtual.metodoCalculo = pecaDoCatalogo.metodoCalculo;
        pecaAtual.largura = pecaDoCatalogo.largura;
        pecaAtual.comprimento = pecaDoCatalogo.comprimento;
        pecaAtual.area = pecaDoCatalogo.area;
        pecaAtual.peso = pecaDoCatalogo.peso;
        pecaAtual.espessura = pecaDoCatalogo.espessura;
        pecaAtual.dobras = pecaDoCatalogo.dobras;

        salvarEstado();
        renderizarPecas();
        fecharModalBuscaPeca();
    }
}
window.addEventListener('DOMContentLoaded', carregarEstado);

// --- FUNÇÕES DE EXPORTAÇÃO/IMPORTAÇÃO CSV ---

function escapeCsvField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    let value = String(field);
    // Se o campo contiver vírgulas, aspas duplas ou quebras de linha, envolva-o em aspas duplas
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        // Escapa aspas duplas internas duplicando-as
        value = value.replace(/"/g, '""');
        return `"${value}"`;
    }
    return value;
}

function convertToCsv(data, headers) {
    const csvRows = [];
    csvRows.push(headers.map(escapeCsvField).join(',')); // Adiciona o cabeçalho

    data.forEach(row => {
        const values = headers.map(header => {
            // Se o valor for um objeto (como 'pecas' dentro de propostas), stringify para JSON
            if (typeof row[header] === 'object' && row[header] !== null) {
                return escapeCsvField(JSON.stringify(row[header]));
            }
            return escapeCsvField(row[header]);
        });
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
}

function parseCsv(csvString) {
    const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Divide por vírgula, ignorando vírgulas dentro de aspas
        const row = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1).replace(/""/g, '"');
            }
            row[header] = value;
        });
        data.push(row);
    }
    return data;
}

function exportDataToCsv() {
    let csvContent = '';

    // --- Exportar Catálogo de Peças ---
    const catalogoHeaders = ['codigo', 'nome', 'material', 'metodoCalculo', 'largura', 'comprimento', 'area', 'peso', 'espessura', 'dobras'];
    const catalogoData = Object.values(appState.catalogoPecas).map(peca => ({
        ...peca,
        codigo: peca.codigo // Garante que o código seja incluído
    }));
    csvContent += '# CATALOGO_PECAS_START\n';
    csvContent += convertToCsv(catalogoData, catalogoHeaders);
    csvContent += '\n# CATALOGO_PECAS_END\n\n';

    // --- Exportar Propostas Salvas ---
    const propostasHeaders = ['numeroProposta', 'empresa', 'cnpjEmpresa', 'vendedor', 'cliente', 'cpfCnpjCliente', 'dataEmissao', 'dataValidadeStr', 'totalGeral', 'pesoTotalPedido', 'pecasJson'];
    const propostasData = appState.propostasSalvas.map(proposta => ({
        ...proposta,
        pecasJson: JSON.stringify(proposta.pecas) // Stringify o array de peças
    }));
    csvContent += '# PROPOSTAS_SALVAS_START\n';
    csvContent += convertToCsv(propostasData, propostasHeaders);
    csvContent += '\n# PROPOSTAS_SALVAS_END\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'dados_orcamento_laser.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Dados exportados com sucesso para dados_orcamento_laser.csv!');
    }
}

function importDataFromCsv(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const csvString = e.target.result;
        const sections = csvString.split(/(# CATALOGO_PECAS_START|# CATALOGO_PECAS_END|# PROPOSTAS_SALVAS_START|# PROPOSTAS_SALVAS_END)\n/);

        let newCatalogoPecas = {};
        let newPropostasSalvas = [];

        // Parse Catálogo de Peças
        const catalogoStartIndex = sections.indexOf('# CATALOGO_PECAS_START') + 1;
        const catalogoEndIndex = sections.indexOf('# CATALOGO_PECAS_END');
        if (catalogoStartIndex > 0 && catalogoEndIndex > catalogoStartIndex) {
            const catalogoCsv = sections[catalogoStartIndex];
            const parsedCatalogo = parseCsv(catalogoCsv);
            parsedCatalogo.forEach(peca => {
                // Converte tipos de volta
                peca.codigo = parseInt(peca.codigo);
                peca.largura = parseFloat(peca.largura);
                peca.comprimento = parseFloat(peca.comprimento);
                peca.area = parseFloat(peca.area);
                peca.peso = parseFloat(peca.peso);
                peca.espessura = parseFloat(peca.espessura);
                peca.dobras = parseInt(peca.dobras);
                newCatalogoPecas[peca.codigo] = peca;
            });
        }

        // Parse Propostas Salvas
        const propostasStartIndex = sections.indexOf('# PROPOSTAS_SALVAS_START') + 1;
        const propostasEndIndex = sections.indexOf('# PROPOSTAS_SALVAS_END');
        if (propostasStartIndex > 0 && propostasEndIndex > propostasStartIndex) {
            const propostasCsv = sections[propostasStartIndex];
            const parsedPropostas = parseCsv(propostasCsv);
            newPropostasSalvas = parsedPropostas.map(proposta => {
                // Converte tipos de volta e parseia o JSON de peças
                proposta.numeroProposta = String(proposta.numeroProposta); // Manter como string para evitar problemas com leading zeros se houver
                proposta.totalGeral = parseFloat(proposta.totalGeral);
                proposta.pesoTotalPedido = parseFloat(proposta.pesoTotalPedido);
                try {
                    proposta.pecas = JSON.parse(proposta.pecasJson);
                } catch (e) {
                    console.error("Erro ao parsear JSON de peças na proposta:", e);
                    proposta.pecas = []; // Fallback para array vazio
                }
                delete proposta.pecasJson; // Remove a string JSON original
                return proposta;
            });
        }

        // Atualiza o estado da aplicação
        appState.catalogoPecas = newCatalogoPecas;
        appState.propostasSalvas = newPropostasSalvas;
        
        // Recalcula o próximo código de peça e proposta
        atualizarProximoCodigoPeca();
        if (newPropostasSalvas.length > 0) {
            const maxPropostaNum = Math.max(...newPropostasSalvas.map(p => parseInt(p.numeroProposta)).filter(n => !isNaN(n)));
            appState.proximoCodigoProposta = maxPropostaNum + 1;
        } else {
            appState.proximoCodigoProposta = 22000; // Valor inicial
        }
        document.getElementById('numeroProposta').value = appState.proximoCodigoProposta;

        salvarEstado(); // Salva o novo estado no localStorage
        renderizarPecas();
        renderizarCatalogoPecas();
        renderizarHistoricoPropostas();

        alert('Dados importados com sucesso!');
    };
    reader.readAsText(file);

    // Limpa o input file para permitir a importação do mesmo arquivo novamente
    event.target.value = '';
}

function clearAllData() {
    const confirmation = confirm(
        "ATENÇÃO: Esta ação irá APAGAR TODOS os dados salvos no sistema (peças, catálogo e histórico de propostas).\n\nTem certeza que deseja continuar?"
    );

    if (confirmation) {
        // Resetar o estado da aplicação para os valores iniciais
        appState.pecas = [];
        appState.catalogoPecas = {};
        appState.propostasSalvas = [];
        appState.proximoCodigoPeca = 18100;
        appState.proximoCodigoProposta = 22000;

        // Atualizar o localStorage
        salvarEstado();

        // Renderizar a interface para refletir o estado limpo
        renderizarPecas();
        renderizarCatalogoPecas();
        renderizarHistoricoPropostas();
        document.getElementById('numeroProposta').value = appState.proximoCodigoProposta;
        alert("Todos os dados foram limpos com sucesso!");
    }
}
