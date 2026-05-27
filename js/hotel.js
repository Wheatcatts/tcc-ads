function definirDataMinima() {
    const input = document.getElementById('checkinDate');
    if (input) {
        const ano = dataAtual.getFullYear();
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        input.min = `${ano}-${mes}-${dia}`;
        input.value = `${ano}-${mes}-${dia}`;
    }
    atualizarMinCheckout();
}

function atualizarMinCheckout() {
    const checkin = document.getElementById('checkinDate');
    const checkout = document.getElementById('checkoutDate');
    if (checkin && checkout && checkin.value) {
        const min = new Date(checkin.value);
        min.setDate(min.getDate() + 1);
        const ano = min.getFullYear();
        const mes = String(min.getMonth() + 1).padStart(2, '0');
        const dia = String(min.getDate()).padStart(2, '0');
        checkout.min = `${ano}-${mes}-${dia}`;
        if (checkout.value && new Date(checkout.value) < min) {
            checkout.value = `${ano}-${mes}-${dia}`;
        }
    }
}

async function calcularDias() {
    const checkinVal = document.getElementById('checkinDate').value;
    const checkoutVal = document.getElementById('checkoutDate').value;
    if (!checkinVal || !checkoutVal) { alert('Selecione as datas.'); return false; }
    checkinDate = new Date(checkinVal); checkinDate.setHours(0,0,0,0);
    checkoutDate = new Date(checkoutVal); checkoutDate.setHours(0,0,0,0);
    if (checkinDate < dataAtual) { alert(`Check-in não pode ser anterior a ${dataAtual.toLocaleDateString('pt-BR')}`); return false; }
    if (checkoutDate <= checkinDate) { alert('Check-out deve ser maior que check-in'); return false; }
    diasEstadia = Math.ceil((checkoutDate - checkinDate) / (1000*60*60*24));
    // Buscar quartos disponíveis para o período escolhido
    try {
        const res = await fetch(`${API}/quartos?checkin=${checkinVal}&checkout=${checkoutVal}`);
        const data = await res.json();
        quartos = data.map(q => ({ ...q, precoDiaria: parseFloat(q.preco_diaria) }));
    } catch (err) {
        console.error('Erro ao buscar quartos disponíveis:', err);
    }
    alert(`${diasEstadia} noite(s) selecionada(s). ${quartos.length} quarto(s) disponível(is).`);
    renderizarQuartos();
    return true;
}

function renderizarQuartos() {
    const grid = document.getElementById('gridQuartos');
    if (!grid) return;
    grid.innerHTML = quartos.map(q => {
        const precoTotal = diasEstadia > 0 ? q.precoDiaria * diasEstadia : q.precoDiaria;
        return `
            <div class="quarto-card">
                <div class="quarto-imagem" onclick="mostrarDetalhesQuarto('${q.id}')"><img src="${q.imagem}" alt="${q.nome}"></div>
                <h3 onclick="mostrarDetalhesQuarto('${q.id}')">${q.nome}</h3>
                <p>${q.descricao}</p>
                <div class="quarto-info"><span>👥 ${q.capacidade}</span><span>🛏️ ${q.cama}</span></div>
                <div class="quarto-preco">R$ ${q.precoDiaria} <small>/noite</small></div>
                ${diasEstadia > 0 ? `<div class="quarto-preco-total">Total: R$ ${precoTotal}</div>` : ''}
                <button class="btn-add-carrinho" onclick="adicionarAoCarrinho('${q.id}')" ${diasEstadia === 0 ? 'disabled' : ''}>🛒 Reservar</button>
            </div>`;
    }).join('');
}

function renderizarServicos() {
    const template = s => `<div class="servico-card"><div class="servico-imagem"><img src="${s.imagem}"></div><span class="servico-icone">${s.icone}</span><h4>${s.nome}</h4><p>${s.descricao}</p></div>`;
    const grid = document.getElementById('gridServicos');
    if (grid) grid.innerHTML = servicos.map(template).join('');
    const gridInicial = document.getElementById('gridServicosIniciais');
    if (gridInicial) gridInicial.innerHTML = servicos.map(template).join('');
}

function renderizarAvaliacoes() {
    const listaAv = document.getElementById('listaAvaliacoes');
    const quantidadeAv = document.getElementById('quantidadeAvaliacoes');
    if (!listaAv) return;
    listaAv.innerHTML = avaliacoes.map(a => `
        <div class="avaliacao-card">
            <div class="avaliacao-header"><span>${a.nome}</span><span>${a.data}</span></div>
            <div class="avaliacao-estrelas">${'⭐'.repeat(a.estrelas)}${'☆'.repeat(5-a.estrelas)}</div>
            <p>${a.comentario}</p>
            ${a.resposta ? `<p style="color:#004d40;font-style:italic;margin-top:0.5rem;">💬 ${a.resposta}</p>` : ''}
        </div>`).join('');
    if (quantidadeAv) quantidadeAv.textContent = `(${avaliacoes.length} avaliações)`;
}

function adicionarAoCarrinho(quartoId) {
    if (diasEstadia === 0) { alert('Selecione as datas primeiro.'); return; }
    const id = isNaN(quartoId) ? quartoId : parseInt(quartoId); // normaliza string vs número
    const quarto = quartos.find(q => q.id === id);
    const existente = carrinho.find(item => item.id === id);
    if (existente) existente.quantidade++;
    else carrinho.push({ ...quarto, quantidade: 1 });
    atualizarCarrinho();
    atualizarContadorCarrinho();
    alert(`${quarto.nome} adicionado ao carrinho!`);
}

function removerDoCarrinho(quartoId) {
    const id = isNaN(quartoId) ? quartoId : parseInt(quartoId);
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const qtd = carrinho.reduce((s, i) => s + i.quantidade, 0);
    const el = document.getElementById('carrinhoQuantidade');
    if (el) el.textContent = qtd;
}

function atualizarCarrinho() {
    const conteudo = document.getElementById('carrinhoConteudo');
    const totalEl = document.getElementById('carrinhoTotal');
    if (!conteudo) return;
    if (carrinho.length === 0) {
        conteudo.innerHTML = '<p style="text-align:center;">Carrinho vazio</p>';
        if (totalEl) totalEl.innerHTML = '';
        return;
    }
    let total = 0;
    let html = '';
    carrinho.forEach(item => {
        const subtotal = item.precoDiaria * diasEstadia * item.quantidade;
        total += subtotal;
        html += `<div class="carrinho-item"><div><h4>${item.nome}</h4><p>${diasEstadia} noite(s) x R$ ${item.precoDiaria}</p><p>Qtde: ${item.quantidade}</p></div><div>R$ ${subtotal}</div><button class="btn-remover-item" onclick="removerDoCarrinho('${item.id}')">Remover</button></div>`;
    });
    conteudo.innerHTML = html;
    if (totalEl) totalEl.innerHTML = `Total: R$ ${total}`;
}

async function finalizarReserva() {
    if (carrinho.length === 0) { alert('Carrinho vazio.'); return; }
    if (!checkinDate || !checkoutDate) { alert('Selecione as datas de check-in e check-out.'); return; }
    if (!usuarioLogado) { alert('Você precisa estar logado para reservar.'); return; }
    const total = carrinho.reduce((sum, item) => sum + (item.precoDiaria * diasEstadia * item.quantidade), 0);
    const checkinStr = document.getElementById('checkinDate').value;
    const checkoutStr = document.getElementById('checkoutDate').value;
    try {
        const res = await fetch(`${API}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioLogado.id,
                checkin: checkinStr,
                checkout: checkoutStr,
                noites: diasEstadia,
                total: total.toFixed(2),
                itens: carrinho.map(item => ({ quarto_id: item.id, quantidade: item.quantidade }))
            })
        });
        const novaReserva = await res.json();
        if (!res.ok) { alert(novaReserva.erro); return; }
        reservas.push(novaReserva);
        atualizarContadorReservas();
        carrinho = [];
        atualizarContadorCarrinho();
        fecharModal('modalCarrinho');
        document.getElementById('confirmacaoDetalhe').innerHTML = `
            ✅ <strong>Reserva confirmada com sucesso!</strong><br><br>
            <strong>Valor total: R$ ${total.toFixed(2)}</strong><br><br>
            💰 <strong>Forma de pagamento:</strong> O pagamento será realizado no dia do <strong>check-in</strong>, diretamente na <strong>recepção do hotel</strong>.<br>
            Aceitamos dinheiro, cartão de débito, crédito e PIX.<br><br>
            📅 <strong>Check-in:</strong> ${new Date(checkinStr).toLocaleDateString('pt-BR')}<br>
            📅 <strong>Check-out:</strong> ${new Date(checkoutStr).toLocaleDateString('pt-BR')}<br>
            🛌 <strong>Noites:</strong> ${diasEstadia}<br><br>
            Em caso de dúvidas, entre em contato conosco.
        `;
        document.getElementById('modalConfirmacao').classList.remove('oculto');
    } catch (err) {
        alert('Erro ao finalizar reserva.');
    }
}

function atualizarContadorReservas() {
    const el = document.getElementById('reservasQuantidade');
    if (el) el.textContent = reservas.length;
}

function abrirReservas() {
    const conteudo = document.getElementById('reservasConteudo');
    if (reservas.length === 0) {
        conteudo.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
    } else {
        conteudo.innerHTML = reservas.map((r, i) => `
            <div class="reserva-item">
                <div class="reserva-header"><h4>Reserva #${i+1}</h4><span class="reserva-status">Confirmada</span></div>
                <div class="reserva-detalhes">
                    <div>Check-in: ${new Date(r.checkin).toLocaleDateString('pt-BR')}</div>
                    <div>Check-out: ${new Date(r.checkout).toLocaleDateString('pt-BR')}</div>
                    <div>Noites: ${r.noites}</div>
                </div>
                <div class="reserva-total">Total: R$ ${r.total}</div>
            </div>`).join('');
    }
    document.getElementById('modalReservas').classList.remove('oculto');
}

function mostrarDetalhesQuarto(quartoId) {
    const id = isNaN(quartoId) ? quartoId : parseInt(quartoId);
    const q = quartos.find(q => q.id === id);
    if (!q) return;
    document.getElementById('modalDetalhesConteudo').innerHTML = `
        <h2>${q.nome}</h2>
        <img src="${q.imagem}" style="width:100%;border-radius:20px;margin-bottom:1rem;">
        <p>${q.descricao}</p>
        <p><strong>Capacidade:</strong> ${q.capacidade}</p>
        <p><strong>Cama:</strong> ${q.cama}</p>
        <div class="modal-preco">R$ ${q.precoDiaria}/noite</div>
        <button class="btn-acao-login" onclick="fecharModal('modalDetalhes')">Fechar</button>
    `;
    document.getElementById('modalDetalhes').classList.remove('oculto');
}

function abrirCarrinho() { document.getElementById('modalCarrinho').classList.remove('oculto'); atualizarCarrinho(); }
function fecharModal(modalId) { document.getElementById(modalId).classList.add('oculto'); }
function abrirTermosModal() { document.getElementById('modalTermos').classList.remove('oculto'); }
function abrirPrivacidadeModal() { document.getElementById('modalPrivacidade').classList.remove('oculto'); }

function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        const cabecalho = document.getElementById('cabecalho');
        if (window.scrollY > 100) cabecalho.classList.add('fixo');
        else cabecalho.classList.remove('fixo');
    });
}

function inicializarEstrelas() {
    const estrelas = document.querySelectorAll('.estrela');
    if (!estrelas.length) return;
    estrelas.forEach(e => {
        e.addEventListener('mouseover', function() {
            const val = parseInt(this.dataset.valor);
            estrelas.forEach((el, idx) => el.textContent = idx < val ? '⭐' : '☆');
        });
        e.addEventListener('click', function() { avaliacaoAtual = parseInt(this.dataset.valor); });
        e.addEventListener('mouseout', () => {
            estrelas.forEach((el, idx) => el.textContent = idx < avaliacaoAtual ? '⭐' : '☆');
        });
    });
}

async function adicionarAvaliacao() {
    const comentario = document.getElementById('comentarioInput').value.trim();
    if (avaliacaoAtual === 0) { alert('Selecione as estrelas.'); return; }
    if (!comentario) { alert('Escreva um comentário.'); return; }
    if (!usuarioLogado) { alert('Você precisa estar logado para avaliar.'); return; }
    const ofensivo = await contemPalavraOfensivaAPI(comentario);
    if (ofensivo) { alert('❌ Seu comentário contém palavras inadequadas. Por favor, revise antes de enviar.'); return; }
    const data = new Date();
    const mes = data.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const data_avaliacao = `${mes} ${data.getFullYear()}`;
    try {
        const res = await fetch(`${API}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioLogado.id,
                nome_autor: usuarioLogado.nome_completo,
                estrelas: avaliacaoAtual,
                comentario,
                data_avaliacao
            })
        });
        const nova = await res.json();
        avaliacoes.unshift({ ...nova, nome: nova.nome_autor, data: nova.data_avaliacao });
        renderizarAvaliacoes();
        document.getElementById('comentarioInput').value = '';
        avaliacaoAtual = 0;
        document.querySelectorAll('.estrela').forEach(e => e.textContent = '☆');
        alert('Avaliação enviada com sucesso!');
    } catch (err) {
        alert('Erro ao enviar avaliação.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    const sessaoSalva = localStorage.getItem('usuarioLogado');
    if (sessaoSalva) {
        usuarioLogado = JSON.parse(sessaoSalva);
        const resReservas = await fetch(`${API}/reservas/usuario/${usuarioLogado.id}`);
        reservas = await resReservas.json();
        atualizarContadorReservas();
        document.getElementById('userNameDisplay').textContent = usuarioLogado.nome_completo.split(' ')[0];
        document.getElementById('telaInicial').classList.add('oculto');
        document.getElementById('conteudoPrincipal').classList.remove('oculto');
    }

    await carregarDadosIniciais();
    await obterDataAtualAPI();
    definirDataMinima();
    renderizarServicos();
    renderizarAvaliacoes();
    renderizarQuartos();
    inicializarEstrelas();
    initHeaderScroll();
    initBuscaCEP();

    const cpfInput = document.getElementById('cadCpf');
    const telInput = document.getElementById('cadTelefone');
    if (cpfInput) cpfInput.addEventListener('input', () => aplicarMascaraCPF(cpfInput));
    if (telInput) telInput.addEventListener('input', () => aplicarMascaraTelefone(telInput));

    const checkin = document.getElementById('checkinDate');
    const checkout = document.getElementById('checkoutDate');
    if (checkin) checkin.addEventListener('change', () => { atualizarMinCheckout(); if (checkout.value) calcularDias(); });
    if (checkout) checkout.addEventListener('change', () => { if (checkin.value) calcularDias(); });

    document.getElementById('btnAbrirLogin').onclick = () => document.getElementById('areaLogin').classList.remove('oculto');
    document.getElementById('btnIniciarReserva').onclick = () => document.getElementById('areaLogin').classList.remove('oculto');
    document.getElementById('fecharLogin').onclick = () => document.getElementById('areaLogin').classList.add('oculto');
    document.getElementById('fecharLoginBtn').onclick = () => document.getElementById('areaLogin').classList.add('oculto');

    const btnLogin = document.getElementById('btnLoginTab');
    const btnCadastro = document.getElementById('btnCadastroTab');
    const btnEsqueci = document.getElementById('btnEsqueciSenhaTab');
    btnLogin?.addEventListener('click', () => ativarTab(btnLogin));
    btnCadastro?.addEventListener('click', () => ativarTab(btnCadastro));
    btnEsqueci?.addEventListener('click', () => ativarTab(btnEsqueci));
    document.getElementById('linkEsqueciSenha')?.addEventListener('click', (e) => { e.preventDefault(); ativarTab(btnEsqueci); });
    document.getElementById('mudarParaLogin')?.addEventListener('click', (e) => { e.preventDefault(); ativarTab(btnLogin); });
    document.getElementById('voltarParaLogin')?.addEventListener('click', (e) => { e.preventDefault(); ativarTab(btnLogin); });
    document.getElementById('esqueciSenhaForm')?.addEventListener('submit', fazerRecuperacaoSenha);
    document.getElementById('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); validarLogin(); });
    document.getElementById('cadastroForm')?.addEventListener('submit', (e) => { e.preventDefault(); validarCadastro(); });
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        usuarioLogado = null;
        reservas = [];
        localStorage.removeItem('usuarioLogado');
        document.getElementById('conteudoPrincipal').classList.add('oculto');
        document.getElementById('telaInicial').classList.remove('oculto');
        ativarTab(btnLogin);
    });

    document.getElementById('carrinhoIcon')?.addEventListener('click', abrirCarrinho);
    document.getElementById('fecharCarrinho')?.addEventListener('click', () => fecharModal('modalCarrinho'));
    document.getElementById('btnIrParaPagamento')?.addEventListener('click', finalizarReserva);
    document.getElementById('reservasIcon')?.addEventListener('click', abrirReservas);
    document.getElementById('fecharReservas')?.addEventListener('click', () => fecharModal('modalReservas'));
    document.getElementById('calcularDatas')?.addEventListener('click', calcularDias);
    document.getElementById('btnEnviarAvaliacao')?.addEventListener('click', adicionarAvaliacao);
    document.getElementById('fecharConfirmacao')?.addEventListener('click', () => fecharModal('modalConfirmacao'));
    document.getElementById('btnFecharConfirmacao')?.addEventListener('click', () => fecharModal('modalConfirmacao'));
    document.getElementById('fecharDetalhes')?.addEventListener('click', () => fecharModal('modalDetalhes'));
    document.getElementById('abrirTermosModal')?.addEventListener('click', (e) => { e.preventDefault(); abrirTermosModal(); });
    document.getElementById('abrirPrivacidadeModal')?.addEventListener('click', (e) => { e.preventDefault(); abrirPrivacidadeModal(); });
    document.getElementById('fecharTermosModal')?.addEventListener('click', () => fecharModal('modalTermos'));
    document.getElementById('fecharPrivacidadeModal')?.addEventListener('click', () => fecharModal('modalPrivacidade'));
    document.getElementById('btnAbrirColaboradores')?.addEventListener('click', abrirPainelColaboradores);
    document.getElementById('fecharColaboradores')?.addEventListener('click', fecharPainelColaboradores);
    document.getElementById('colaboradorLoginForm')?.addEventListener('submit', loginColaborador);
    document.getElementById('btnLogoutColaborador')?.addEventListener('click', logoutColaborador);
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.classList.add('oculto'); });
    document.getElementById('btnMostrarFormColab')?.addEventListener('click', () => document.getElementById('formNovoColaborador').classList.toggle('oculto'));
    document.getElementById('btnCancelarFormColab')?.addEventListener('click', () => document.getElementById('formNovoColaborador').classList.add('oculto'));
    document.getElementById('btnSalvarColaborador')?.addEventListener('click', salvarNovoColaborador);
});

window.mostrarDetalhesQuarto = mostrarDetalhesQuarto;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.fecharModal = fecharModal;
window.abrirChatUsuario = abrirChatUsuario;
window.enviarMensagemChat = enviarMensagemChat;
window.responderAvaliacao = responderAvaliacao;
window.excluirAvaliacao = excluirAvaliacao;
window.removerColaborador = removerColaborador;
window.navegarPainel = navegarPainel;
window.editarQuarto = editarQuarto;
window.excluirQuarto = excluirQuarto;
window.editarServico = editarServico;
window.excluirServico = excluirServico;
