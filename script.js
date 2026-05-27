// ===== SISTEMA DE COLABORADORES =====
let colaboradores = JSON.parse(localStorage.getItem('colaboradores')) || [
    {
        id: 'sup1',
        nome: 'Carlos Mendes',
        email: 'diretor@atlanticopalace.com',
        cargo: 'Diretor Geral',
        nivel: 'superior',
        senha: 'admin123',
        telefone: '(11) 99999-0001',
        ativo: true
    },
    {
        id: 'col1',
        nome: 'Ana Oliveira',
        email: 'ana@atlanticopalace.com',
        cargo: 'Recepcionista',
        nivel: 'colaborador',
        senha: 'colab123',
        telefone: '(11) 99999-0002',
        ativo: true
    }
];

let colaboradorLogado = null;
let chatsSistema = JSON.parse(localStorage.getItem('chatsSistema')) || [];
let chatAtivoId = null;
let atividadesRecentes = JSON.parse(localStorage.getItem('atividadesColab')) || [];

function abrirPainelColaboradores() {
    document.getElementById('areaColaboradores').classList.remove('oculto');
    if (colaboradorLogado) {
        document.getElementById('colaboradorLogin').classList.add('oculto');
        document.getElementById('btnAbrirLogin').classList.add('oculto');
        document.getElementById('colaboradorPainel').classList.remove('oculto');
        carregarDadosColaborador();
    } else {
        document.getElementById('colaboradorLogin').classList.remove('oculto');
        document.getElementById('btnAbrirLogin').classList.remove('oculto');
        document.getElementById('colaboradorPainel').classList.add('oculto');
    }
    document.getElementById('areaLogin').classList.add('oculto');
}

function fecharPainelColaboradores() {
    document.getElementById('areaColaboradores').classList.add('oculto');
}

function loginColaborador(e) {
    e.preventDefault();
    const email = document.getElementById('colabEmail').value.trim();
    const senha = document.getElementById('colabSenha').value;
    const colab = colaboradores.find(c => c.email === email && c.senha === senha && c.ativo);
    
    if (email === 'admin@gmail.com' && senha === '123456') {
        abrirPainelAdministrador();
        document.getElementById('areaColaboradores').classList.add('oculto');
        document.getElementById('colaboradorLoginForm').reset();
        return;
    }
    
    if (!colab) {
        mostrarToast('Credenciais inválidas!', 'error');
        return;
    }
    
    colaboradorLogado = colab;
    document.getElementById('colaboradorLogin').classList.add('oculto');
    document.getElementById('colaboradorPainel').classList.remove('oculto');
    carregarDadosColaborador();
    document.getElementById('colaboradorLoginForm').reset();
    mostrarToast(`Bem-vindo, ${colab.nome}!`);
}

function logoutColaborador() {
    colaboradorLogado = null;
    chatAtivoId = null;
    document.getElementById('colaboradorLogin').classList.remove('oculto');
    document.getElementById('colaboradorPainel').classList.add('oculto');
    mostrarToast('Logout realizado!');
}

function carregarDadosColaborador() {
    if (!colaboradorLogado) return;
    document.getElementById('colabNome').textContent = colaboradorLogado.nome;
    document.getElementById('colabCargo').textContent = colaboradorLogado.cargo;
    const navGestao = document.getElementById('navGestao');
    if (colaboradorLogado.nivel === 'superior') {
        navGestao.classList.remove('nav-item-bloqueado');
        navGestao.title = '';
    } else {
        navGestao.classList.add('nav-item-bloqueado');
        navGestao.title = 'Apenas superiores têm acesso';
    }
    atualizarDashboard();
    carregarAvaliacoesPainel();
    carregarContatosChat();
    carregarListaColaboradores();
    navegarPainel('dashboard');
}

function navegarPainel(secao) {
    if (secao === 'gestao' && colaboradorLogado.nivel !== 'superior') {
        mostrarToast('Acesso restrito a superiores!', 'error');
        return;
    }
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('ativo'));
    const navAtivo = document.querySelector(`[data-secao="${secao}"]`);
    if (navAtivo) navAtivo.classList.add('ativo');
    document.querySelectorAll('.painel-secao').forEach(s => s.classList.remove('ativo'));
    const secaoAtiva = document.getElementById(`secao-${secao}`);
    if (secaoAtiva) secaoAtiva.classList.add('ativo');
    if (secao === 'dashboard') atualizarDashboard();
    if (secao === 'avaliacoes') carregarAvaliacoesPainel();
    if (secao === 'chats') carregarContatosChat();
    if (secao === 'gestao') carregarListaColaboradores();
}

function atualizarDashboard() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    document.getElementById('dashUsuarios').textContent = usuarios.length;
    document.getElementById('dashReservas').textContent = reservas.length;
    document.getElementById('dashAvaliacoes').textContent = avaliacoes.length;
    document.getElementById('dashChats').textContent = chatsSistema.length;
}

function carregarAvaliacoesPainel() {
    const container = document.getElementById('avaliacoesContainer');
    if (!container) return;
    const filtroBusca = document.getElementById('buscarAvaliacao')?.value || '';
    const filtroEstrelas = document.getElementById('filtroEstrelasColab')?.value || 'todas';
    let filtradas = avaliacoes.filter(a => {
        const matchTexto = !filtroBusca || a.nome.toLowerCase().includes(filtroBusca.toLowerCase()) || a.comentario.toLowerCase().includes(filtroBusca.toLowerCase());
        const matchEstrelas = filtroEstrelas === 'todas' || a.estrelas === parseInt(filtroEstrelas);
        return matchTexto && matchEstrelas;
    });
    if (filtradas.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:3rem;">Nenhuma avaliação encontrada.</div>';
        return;
    }
    container.innerHTML = filtradas.map((a, i) => `
        <div class="avaliacao-card-colab">
            <div class="avaliacao-card-header">
                <div class="avaliacao-card-autor">
                    <div class="avaliacao-autor-avatar">${a.nome.charAt(0).toUpperCase()}</div>
                    <div><strong>${a.nome}</strong><div class="avaliacao-estrelas-display">${'⭐'.repeat(a.estrelas)}${'☆'.repeat(5-a.estrelas)}</div></div>
                </div>
                <span>${a.data}</span>
            </div>
            <p class="avaliacao-card-comentario">"${a.comentario}"</p>
            <div class="avaliacao-card-acoes">
                <button class="btn-acao-avaliacao btn-responder" onclick="responderAvaliacao(${i})">💬 Responder</button>
                <button class="btn-acao-avaliacao btn-excluir" onclick="excluirAvaliacao(${i})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

function excluirAvaliacao(index) {
    if (!confirm('Excluir esta avaliação?')) return;
    const avaliacao = avaliacoes[index];
    avaliacoes.splice(index, 1);
    localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
    carregarAvaliacoesPainel();
    renderizarAvaliacoes();
    mostrarToast('Avaliação excluída.');
}

function responderAvaliacao(index) {
    const resposta = prompt('Digite sua resposta:');
    if (!resposta) return;
    avaliacoes[index].resposta = resposta;
    avaliacoes[index].respostaData = new Date().toLocaleString('pt-BR');
    localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
    carregarAvaliacoesPainel();
    renderizarAvaliacoes();
    mostrarToast('Resposta enviada.');
}

function carregarContatosChat() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const container = document.getElementById('chatContactsList');
    if (!container) return;
    if (usuarios.length === 0) {
        container.innerHTML = '<div style="padding:1rem;text-align:center;">Nenhum usuário ainda.</div>';
        return;
    }
    container.innerHTML = usuarios.map(u => `
        <div class="chat-contact-item" onclick="abrirChatUsuario('${u.email}')">
            <div class="chat-contact-avatar">${u.nomeCompleto.charAt(0).toUpperCase()}</div>
            <div class="chat-contact-info">
                <div class="chat-contact-nome">${u.nomeCompleto}</div>
                <div class="chat-contact-preview">${u.email}</div>
            </div>
        </div>
    `).join('');
}

function abrirChatUsuario(emailUsuario) {
    chatAtivoId = emailUsuario;
    const container = document.getElementById('chatActiveContainer');
    if (!container) return;
    const usuario = JSON.parse(localStorage.getItem('usuarios'))?.find(u => u.email === emailUsuario);
    if (!usuario) return;
    let chat = chatsSistema.find(c => c.usuario === emailUsuario);
    if (!chat) {
        chat = { usuario: emailUsuario, mensagens: [] };
        chatsSistema.push(chat);
        localStorage.setItem('chatsSistema', JSON.stringify(chatsSistema));
    }
    container.innerHTML = `
        <div class="chat-main-header">
            <div class="chat-contact-avatar" style="width:40px;height:40px;">${usuario.nomeCompleto.charAt(0).toUpperCase()}</div>
            <div><strong>${usuario.nomeCompleto}</strong><br><span style="font-size:0.8rem;">${usuario.email}</span></div>
        </div>
        <div class="chat-messages" id="chatMessagesArea">
            ${chat.mensagens.map(msg => `
                <div class="message-bubble ${msg.remetente === 'colaborador' ? 'message-sent' : 'message-received'}">
                    ${msg.texto}
                    <div class="message-time">${new Date(msg.timestamp).toLocaleString('pt-BR')}</div>
                </div>
            `).join('')}
        </div>
        <div class="chat-input-box">
            <input type="text" id="chatInputMensagem" placeholder="Digite sua mensagem...">
            <button class="btn-send-message" onclick="enviarMensagemChat('${emailUsuario}')">📤</button>
        </div>
    `;
    const messagesDiv = document.getElementById('chatMessagesArea');
    if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function enviarMensagemChat(emailUsuario) {
    const input = document.getElementById('chatInputMensagem');
    const texto = input.value.trim();
    if (!texto) return;
    let chat = chatsSistema.find(c => c.usuario === emailUsuario);
    if (!chat) {
        chat = { usuario: emailUsuario, mensagens: [] };
        chatsSistema.push(chat);
    }
    chat.mensagens.push({
        remetente: 'colaborador',
        texto: texto,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('chatsSistema', JSON.stringify(chatsSistema));
    input.value = '';
    abrirChatUsuario(emailUsuario);
}

function carregarListaColaboradores() {
    const container = document.getElementById('colaboradoresListContainer');
    if (!container) return;
    container.innerHTML = colaboradores.filter(c => c.ativo).map(colab => `
        <div class="colaborador-table-row">
            <div class="colaborador-table-nome"><span>👤</span> ${colab.nome}</div>
            <span>${colab.email}</span>
            <span>${colab.cargo}</span>
            <span><span class="nivel-badge ${colab.nivel === 'superior' ? 'nivel-superior' : 'nivel-colaborador'}">${colab.nivel === 'superior' ? 'Superior' : 'Colaborador'}</span></span>
            <span><button class="btn-remover-colaborador" onclick="removerColaborador('${colab.id}')">Remover</button></span>
        </div>
    `).join('');
}

function removerColaborador(id) {
    if (!confirm('Remover este colaborador?')) return;
    const index = colaboradores.findIndex(c => c.id === id);
    if (index !== -1) colaboradores[index].ativo = false;
    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
    carregarListaColaboradores();
    mostrarToast('Colaborador removido.');
}

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notificacao';
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== SISTEMA PRINCIPAL DO HOTEL =====
const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
const EMAILJS_SERVICE_ID = 'SEU_SERVICE_ID_AQUI';
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID_AQUI';
emailjs.init(EMAILJS_PUBLIC_KEY);

let dataAtual = new Date();

async function obterDataAtualAPI() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
        const data = await response.json();
        if (data && data.datetime) dataAtual = new Date(data.datetime);
        else throw new Error();
    } catch (error) {
        dataAtual = new Date();
    }
    dataAtual.setHours(0, 0, 0, 0);
    return dataAtual;
}

let quartos = JSON.parse(localStorage.getItem('quartos')) || [
    { id: 'oceano', nome: 'Suíte Master Oceano', precoDiaria: 890, imagem: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=90', descricao: 'Ampla suíte com cama king size, TV 55" 4K, varanda privativa com vista panorâmica para o mar e banheiro de mármore com ducha.', capacidade: '2 pessoas', cama: 'King size' },
    { id: 'natureza', nome: 'Suíte Natureza', precoDiaria: 690, imagem: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=90', descricao: 'Suíte aconchegante com cama queen size, TV 50" 4K, varanda com jardim privativo e banheira de hidromassagem.', capacidade: '2 pessoas', cama: 'Queen size' },
    { id: 'premium', nome: 'Suíte Premium', precoDiaria: 1190, imagem: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=90', descricao: 'Suíte espaçosa com duas camas queen, TV 65" 4K, sala de estar separada e área de estar.', capacidade: '4 pessoas', cama: '2 Queen' },
    { id: 'presidencial', nome: 'Suíte Presidencial', precoDiaria: 2500, imagem: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=90', descricao: 'Acomodação de luxo com cama super king, TV 75" 8K, closet, sala de estar e vista panorâmica.', capacidade: '2 pessoas', cama: 'Super King' }
];

let servicos = JSON.parse(localStorage.getItem('servicos')) || [
    { icone: '🍳', nome: 'Café da manhã', descricao: 'Buffet completo das 6h às 10h com produtos regionais.', imagem: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=90' },
    { icone: '🌐', nome: 'Wi-Fi Premium', descricao: 'Conexão de alta velocidade em todas as áreas.', imagem: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&q=90' },
    { icone: '🚗', nome: 'Estacionamento', descricao: 'Coberto e seguro com manobrista 24h.', imagem: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&q=90' },
    { icone: '🔄', nome: 'Serviço de quarto', descricao: '24 horas por dia. Equipe dedicada.', imagem: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=90' }
];

let avaliacoes = [
    { nome: 'Dr. Ricardo Mendes', data: 'Mar 2026', estrelas: 5, comentario: 'Excelente hotel, com instalações impecáveis e atendimento de primeira.' },
    { nome: 'Julia Souza', data: 'Mar 2026', estrelas: 5, comentario: 'Gente, que lugar incrível! A vista é perfeita, amei tudo!' },
    { nome: 'Profa. Ana Beatriz', data: 'Fev 2026', estrelas: 5, comentario: 'Hospedagem excepcional. Funcionários extremamente corteses.' },
    { nome: 'Pedro Henrique', data: 'Fev 2026', estrelas: 5, comentario: 'Mano, hotel top demais! Voltando com certeza!' },
    { nome: 'Eng. Carlos Eduardo', data: 'Jan 2026', estrelas: 4, comentario: 'Ótima experiência. A estrutura do hotel é muito boa.' },
    { nome: 'Camila Fernandes', data: 'Jan 2026', estrelas: 4, comentario: 'Hotel muito bom, quarto limpo e confortável.' }
];

let carrinho = [], reservas = [];
let checkinDate = null, checkoutDate = null, diasEstadia = 0, avaliacaoAtual = 0;
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

const palavrasProibidas = [
    "puta", "caralho", "merda", "bosta", "foda", "fdp", "filho da puta", "filha da puta",
    "cacete", "porra", "viado", "buceta", "pau no cu", "arrombado", "desgraçado",
    "vagabundo", "otario", "otária", "cu", "vsf", "tnc", "piranha", "corno", "escroto",
    "nojento", "lixo", "babaca", "idiota", "imbecil", "retardado", "mongol", "troxa",
    "besta", "analfabeto", "burro", "ignorante", "escória", "verme", "nojenta",
    "repugnante", "inútil", "fracassado", "aborto", "maldito", "kct", "krl", "cralho",
    "prr", "poha", "pork", "fd3p", "vtnc", "viadinho", "viadao", "bixa", "bichona",
    "pau", "rola", "piroca", "fuck", "shit", "bitch", "asshole", "damn", "cunt",
    "dick", "cock", "pussy", "bastard", "whore", "slut", "motherfucker"
];

function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function contemPalavraOfensivaLocal(texto) {
    const normalizado = normalizarTexto(texto);
    return palavrasProibidas.some(palavra => normalizado.includes(palavra));
}

async function contemPalavraOfensivaAPI(texto) {
    try {
        const url = `https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(texto)}`;
        const response = await fetch(url);
        const result = await response.text();
        if (result === 'true') return true;
    } catch (error) {
        console.warn('API offline, usando validação local');
    }
    return contemPalavraOfensivaLocal(texto);
}

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

    // Buscar quartos disponíveis para o período
    const res = await fetch(`${API}/quartos?checkin=${checkinVal}&checkout=${checkoutVal}`);
    quartos = (await res.json()).map(q => ({ ...q, precoDiaria: parseFloat(q.preco_diaria) }));

    alert(`${diasEstadia} noite(s) selecionada(s). ${quartos.length} quarto(s) disponível(is).`);
    renderizarQuartos();
    return true;
}

function aplicarMascaraCPF(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    campo.value = valor;
}

function aplicarMascaraTelefone(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 10) valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (valor.length > 6) valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (valor.length > 0) valor = valor.replace(/^(\d*)/, '($1');
    campo.value = valor;
}

function aplicarMascaraCEP(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.slice(0, 8);
    if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d{3})/, '$1-$2');
    campo.value = valor;
}

async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (data.erro) { alert('CEP não encontrado.'); return; }
        const ruaInput = document.getElementById('cadEnderecoRua');
        const bairroInput = document.getElementById('cadBairro');
        const cidadeInput = document.getElementById('cadCidade');
        if (ruaInput) ruaInput.value = data.logradouro || '';
        if (bairroInput) bairroInput.value = data.bairro || '';
        if (cidadeInput) cidadeInput.value = data.localidade || '';
        const estadoSelect = document.getElementById('cadEstado');
        if (estadoSelect && data.uf) {
            for (let i = 0; i < estadoSelect.options.length; i++) {
                if (estadoSelect.options[i].value === data.uf) {
                    estadoSelect.selectedIndex = i;
                    break;
                }
            }
        }
    } catch (error) { alert('Erro ao buscar CEP.'); }
}

function initBuscaCEP() {
    const cepInput = document.getElementById('cadCep');
    if (cepInput) {
        cepInput.addEventListener('blur', () => buscarCEP(cepInput.value));
        cepInput.addEventListener('input', () => aplicarMascaraCEP(cepInput));
    }
}

async function fazerRecuperacaoSenha(event) {
    event.preventDefault();
    const contato = document.getElementById('recuperacaoEmailOuTelefone').value.trim();
    if (!contato) { alert('Informe e-mail ou telefone.'); return; }
    const usuariosLocal = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuario = contato.includes('@') ? usuariosLocal.find(u => u.email === contato) : usuariosLocal.find(u => u.telefone.replace(/\D/g, '') === contato.replace(/\D/g, ''));
    if (!usuario) { alert('Usuário não encontrado.'); return; }
    const resetLink = `https://atlantico-palace.com/redefinir-senha?token=${usuario.email}`;
    const templateParams = { to_email: usuario.email, to_name: usuario.nomeCompleto.split(' ')[0], reset_link: resetLink, message: `Clique para redefinir: ${resetLink}` };
    if (EMAILJS_SERVICE_ID === 'SEU_SERVICE_ID_AQUI') alert(`Simulação: e-mail enviado para ${usuario.email}`);
    else {
        try { await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams); alert(`✅ E-mail enviado para ${usuario.email}`); }
        catch (error) { alert(`❌ Erro: ${error.text}`); }
    }
    document.getElementById('recuperacaoEmailOuTelefone').value = '';
    ativarTab(document.getElementById('btnLoginTab'));
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
    const grid = document.getElementById('gridServicos');
    if (grid) grid.innerHTML = servicos.map(s => `<div class="servico-card"><div class="servico-imagem"><img src="${s.imagem}"></div><span class="servico-icone">${s.icone}</span><h4>${s.nome}</h4><p>${s.descricao}</p></div>`).join('');
    const gridInicial = document.getElementById('gridServicosIniciais');
    if (gridInicial) gridInicial.innerHTML = servicos.map(s => `<div class="servico-card"><div class="servico-imagem"><img src="${s.imagem}"></div><span class="servico-icone">${s.icone}</span><h4>${s.nome}</h4><p>${s.descricao}</p></div>`).join('');
}

function renderizarAvaliacoes() {
    const listaAv = document.getElementById('listaAvaliacoes');
    const quantidadeAv = document.getElementById('quantidadeAvaliacoes');
    if (!listaAv) return;
    listaAv.innerHTML = avaliacoes.map(a => `<div class="avaliacao-card"><div class="avaliacao-header"><span>${a.nome}</span><span>${a.data}</span></div><div class="avaliacao-estrelas">${'⭐'.repeat(a.estrelas)}${'☆'.repeat(5-a.estrelas)}</div><p>${a.comentario}</p></div>`).join('');
    if (quantidadeAv) quantidadeAv.textContent = `(${avaliacoes.length} avaliações)`;
}

function adicionarAoCarrinho(quartoId) {
    if (diasEstadia === 0) { alert('Selecione as datas primeiro.'); return; }
    const quarto = quartos.find(q => q.id === quartoId);
    const existente = carrinho.find(item => item.id === quartoId);
    if (existente) existente.quantidade++;
    else carrinho.push({ ...quarto, quantidade: 1 });
    atualizarCarrinho();
    atualizarContadorCarrinho();
    alert(`${quarto.nome} adicionado ao carrinho!`);
}

function removerDoCarrinho(quartoId) {
    carrinho = carrinho.filter(item => item.id !== quartoId);
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

function finalizarReserva() {
    if (carrinho.length === 0) { alert('Carrinho vazio.'); return; }
    if (!checkinDate || !checkoutDate) { alert('Selecione as datas de check-in e check-out.'); return; }
    const total = carrinho.reduce((sum, item) => sum + (item.precoDiaria * diasEstadia * item.quantidade), 0);
    const novaReserva = {
        checkin: new Date(document.getElementById('checkinDate').value).toLocaleDateString('pt-BR'),
        checkout: new Date(document.getElementById('checkoutDate').value).toLocaleDateString('pt-BR'),
        noites: diasEstadia,
        total: total.toFixed(2)
    };
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
        📅 <strong>Check-in:</strong> ${novaReserva.checkin}<br>
        📅 <strong>Check-out:</strong> ${novaReserva.checkout}<br>
        🛌 <strong>Noites:</strong> ${diasEstadia}<br><br>
        Em caso de dúvidas, entre em contato conosco.
    `;
    document.getElementById('modalConfirmacao').classList.remove('oculto');
}

function atualizarContadorReservas() {
    const el = document.getElementById('reservasQuantidade');
    if (el) el.textContent = reservas.length;
}

function abrirReservas() {
    const conteudo = document.getElementById('reservasConteudo');
    if (reservas.length === 0) conteudo.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
    else {
        let html = '';
        reservas.forEach((r, i) => {
            html += `<div class="reserva-item"><div class="reserva-header"><h4>Reserva #${i+1}</h4><span class="reserva-status">Confirmada</span></div><div class="reserva-detalhes"><div>Check-in: ${r.checkin}</div><div>Check-out: ${r.checkout}</div><div>Noites: ${r.noites}</div></div><div class="reserva-total">Total: R$ ${r.total}</div></div>`;
        });
        conteudo.innerHTML = html;
    }
    document.getElementById('modalReservas').classList.remove('oculto');
}

function mostrarDetalhesQuarto(id) {
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
    const ofensivo = await contemPalavraOfensivaAPI(comentario);
    if (ofensivo) {
        alert('❌ Seu comentário contém palavras inadequadas. Por favor, revise antes de enviar.');
        return;
    }
    const usuario = document.getElementById('userNameDisplay').textContent;
    const data = new Date();
    const mes = data.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    avaliacoes.unshift({ nome: usuario, data: `${mes} ${data.getFullYear()}`, estrelas: avaliacaoAtual, comentario });
    renderizarAvaliacoes();
    document.getElementById('comentarioInput').value = '';
    avaliacaoAtual = 0;
    document.querySelectorAll('.estrela').forEach(e => e.textContent = '☆');
    alert('Avaliação enviada com sucesso!');
}

function validarLogin() {
    const loginInput = document.getElementById('loginEmailOuTelefone').value.trim();
    const senha = document.getElementById('loginSenha').value;
    if (!loginInput || !senha) { alert('Preencha e-mail/telefone e senha.'); return false; }
    if (loginInput === 'admin@gmail.com' && senha === '123456') {
        alert('Acesso administrativo apenas pela Área de Colaboradores (botão 👥 na tela).');
        return false;
    }
    const usuariosLocal = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuario = loginInput.includes('@') ? usuariosLocal.find(u => u.email === loginInput) : usuariosLocal.find(u => u.telefone.replace(/\D/g, '') === loginInput.replace(/\D/g, ''));
    if (!usuario) { alert('Usuário não encontrado.'); return false; }
    if (usuario.senha !== senha) { alert('Senha incorreta.'); return false; }
    document.getElementById('userNameDisplay').textContent = usuario.nomeCompleto.split(' ')[0];
    document.getElementById('telaInicial').classList.add('oculto');
    document.getElementById('conteudoPrincipal').classList.remove('oculto');
    document.getElementById('areaLogin').classList.add('oculto');
    return true;
}

function validarCadastro() {
    const email = document.getElementById('cadEmail').value.trim();
    const telefone = document.getElementById('cadTelefone').value.trim();
    const cpf = document.getElementById('cadCpf').value.trim();
    const senha = document.getElementById('cadSenha').value;
    if (!email || !telefone || !cpf || !senha) { alert('Preencha todos os campos.'); return false; }
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) { alert('CPF inválido'); return false; }
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) { alert('Telefone inválido'); return false; }
    if (senha.length < 6) { alert('Senha mínima 6 caracteres'); return false; }
    if (!document.getElementById('aceitoTermos').checked) { alert('Aceite os Termos de Uso.'); return false; }
    const usuariosLocal = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuariosLocal.find(u => u.email === email)) { alert('E-mail já cadastrado'); return false; }
    if (usuariosLocal.find(u => u.cpf === cpfLimpo)) { alert('CPF já cadastrado'); return false; }
    const novoUsuario = { email, telefone, cpf: cpfLimpo, senha, nomeCompleto: document.getElementById('cadNomeCompleto').value };
    usuariosLocal.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuariosLocal));
    alert(`Cadastro realizado, ${novoUsuario.nomeCompleto}!`);
    document.getElementById('userNameDisplay').textContent = novoUsuario.nomeCompleto.split(' ')[0];
    document.getElementById('telaInicial').classList.add('oculto');
    document.getElementById('conteudoPrincipal').classList.remove('oculto');
    document.getElementById('areaLogin').classList.add('oculto');
    document.getElementById('cadastroForm').reset();
    if (document.getElementById('aceitoTermos')) document.getElementById('aceitoTermos').checked = false;
    return true;
}

function ativarTab(tab) {
    const btns = [document.getElementById('btnLoginTab'), document.getElementById('btnCadastroTab'), document.getElementById('btnEsqueciSenhaTab')];
    const forms = [document.getElementById('formLogin'), document.getElementById('formCadastro'), document.getElementById('formEsqueciSenha')];
    btns.forEach(b => b.classList.remove('ativo'));
    tab.classList.add('ativo');
    forms.forEach(f => f.classList.add('oculto'));
    if (tab === btns[0]) forms[0].classList.remove('oculto');
    else if (tab === btns[1]) forms[1].classList.remove('oculto');
    else forms[2].classList.remove('oculto');
}

// PAINEL ADMINISTRADOR com limite de 10 quartos
function abrirPainelAdministrador() {
    document.getElementById('telaInicial').classList.add('oculto');
    document.getElementById('conteudoPrincipal').classList.add('oculto');
    document.getElementById('areaLogin').classList.add('oculto');
    let areaAdmin = document.getElementById('areaAdmin');
    if (!areaAdmin) {
        areaAdmin = document.createElement('div');
        areaAdmin.id = 'areaAdmin';
        areaAdmin.style.position = 'fixed';
        areaAdmin.style.top = '0';
        areaAdmin.style.left = '0';
        areaAdmin.style.width = '100%';
        areaAdmin.style.height = '100%';
        areaAdmin.style.backgroundColor = '#f5f9fe';
        areaAdmin.style.zIndex = '1000';
        areaAdmin.style.overflowY = 'auto';
        document.body.appendChild(areaAdmin);
    }
    areaAdmin.innerHTML = `
        <div style="max-width:1400px; margin:0 auto; padding:2rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
                <h1 style="color:#004d40; font-size:2rem;">👑 Painel do Administrador</h1>
                <button id="fecharAdminBtn" style="background:#004d40; color:white; border:none; padding:0.8rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">← Sair do Admin</button>
            </div>
            <div style="display:flex; gap:0.8rem; border-bottom:2px solid #e2f0ea; margin-bottom:2rem; flex-wrap:wrap;">
                <button class="admin-tab ativo" data-tab="addQuarto" style="background:#004d40; color:white; border:none; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">➕ Adicionar Quarto (max 10)</button>
                <button class="admin-tab" data-tab="gerenciarQuartos" style="background:transparent; color:#004d40; border:1px solid #004d40; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">📋 Gerenciar Quartos</button>
                <button class="admin-tab" data-tab="addServico" style="background:transparent; color:#004d40; border:1px solid #004d40; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">➕ Adicionar Serviço</button>
                <button class="admin-tab" data-tab="gerenciarServicos" style="background:transparent; color:#004d40; border:1px solid #004d40; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">📋 Gerenciar Serviços</button>
                <button class="admin-tab" data-tab="relatorios" style="background:transparent; color:#004d40; border:1px solid #004d40; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">📊 Relatórios</button>
            </div>
            <div id="adminTabAddQuarto" class="admin-tab-content">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:1.5rem;">Cadastrar novo quarto</h2>
                    <p style="color:#64748b; margin-bottom:1rem;">⚠️ Limite máximo de <strong>10 quartos</strong>. Atualmente: <strong id="contadorQuartosAtual">${quartos.length}</strong>/10</p>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px,1fr)); gap:1.5rem;">
                        <div><label>Nome da suíte *</label><input type="text" id="adminNovoQuartoNome" class="input-data" placeholder="Ex: Suíte Presidencial" style="width:100%;"></div>
                        <div><label>Preço por noite (R$) *</label><input type="number" id="adminNovoQuartoPreco" class="input-data" placeholder="0" style="width:100%;"></div>
                        <div><label>URL da imagem *</label><input type="text" id="adminNovoQuartoImagem" class="input-data" placeholder="https://..." style="width:100%;"></div>
                        <div><label>Descrição *</label><textarea id="adminNovoQuartoDescricao" rows="3" class="input-data" placeholder="Descrição detalhada..."></textarea></div>
                        <div><label>Capacidade</label><input type="text" id="adminNovoQuartoCapacidade" class="input-data" placeholder="Ex: 2 pessoas"></div>
                        <div><label>Tipo de cama</label><input type="text" id="adminNovoQuartoCama" class="input-data" placeholder="Ex: King size"></div>
                    </div>
                    <button id="adminSalvarQuarto" class="btn-acao-login" style="margin-top:2rem;">Salvar Quarto</button>
                </div>
            </div>
            <div id="adminTabGerenciarQuartos" class="admin-tab-content" style="display:none;">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:1.5rem;">📋 Gerenciar Quartos</h2>
                    <div id="listaQuartosAdmin" style="display:flex; flex-direction:column; gap:1rem;"></div>
                </div>
            </div>
            <div id="adminTabAddServico" class="admin-tab-content" style="display:none;">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:1.5rem;">Cadastrar novo serviço</h2>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px,1fr)); gap:1.5rem;">
                        <div><label>Ícone *</label><input type="text" id="adminNovoServicoIcone" class="input-data" placeholder="Ex: 🍳, 🌐, 🚗" style="width:100%;"></div>
                        <div><label>Nome do serviço *</label><input type="text" id="adminNovoServicoNome" class="input-data" placeholder="Ex: Café da manhã" style="width:100%;"></div>
                        <div><label>Descrição *</label><textarea id="adminNovoServicoDescricao" rows="3" class="input-data" placeholder="Descrição..."></textarea></div>
                        <div><label>URL da imagem *</label><input type="text" id="adminNovoServicoImagem" class="input-data" placeholder="https://..." style="width:100%;"></div>
                    </div>
                    <button id="adminSalvarServico" class="btn-acao-login" style="margin-top:2rem;">Salvar Serviço</button>
                </div>
            </div>
            <div id="adminTabGerenciarServicos" class="admin-tab-content" style="display:none;">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:1.5rem;">📋 Gerenciar Serviços</h2>
                    <div id="listaServicosAdmin" style="display:flex; flex-direction:column; gap:1rem;"></div>
                </div>
            </div>
            <div id="adminTabRelatorios" class="admin-tab-content" style="display:none;">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:1.5rem;">📈 Relatórios Gerenciais</h2>
                    <div class="stats-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:1.5rem; margin-bottom:2rem;">
                        <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-info"><span class="stat-valor" id="adminTotalUsuarios">0</span><span class="stat-label">Usuários cadastrados</span></div></div>
                        <div class="stat-card"><div class="stat-icon green">📋</div><div class="stat-info"><span class="stat-valor" id="adminTotalReservas">0</span><span class="stat-label">Reservas realizadas</span></div></div>
                        <div class="stat-card"><div class="stat-icon amber">💰</div><div class="stat-info"><span class="stat-valor" id="adminFaturamentoTotal">R$ 0</span><span class="stat-label">Faturamento total</span></div></div>
                        <div class="stat-card"><div class="stat-icon purple">⭐</div><div class="stat-info"><span class="stat-valor" id="adminMediaAvaliacoes">0</span><span class="stat-label">Média de avaliações</span></div></div>
                    </div>
                    <h3 style="color:#004d40; margin-top:1rem;">Últimas reservas</h3>
                    <div id="adminUltimasReservas" style="max-height:300px; overflow-y:auto; margin-top:1rem;"></div>
                </div>
            </div>
        </div>
    `;
    areaAdmin.classList.remove('oculto');
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab').forEach(t => {
                t.style.background = 'transparent';
                t.style.color = '#004d40';
                t.style.border = '1px solid #004d40';
            });
            tab.style.background = '#004d40';
            tab.style.color = 'white';
            tab.style.border = 'none';
            document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');
            if (target === 'addQuarto') {
                document.getElementById('adminTabAddQuarto').style.display = 'block';
                document.getElementById('contadorQuartosAtual').textContent = quartos.length;
            }
            if (target === 'gerenciarQuartos') {
                document.getElementById('adminTabGerenciarQuartos').style.display = 'block';
                carregarListaQuartosAdmin();
            }
            if (target === 'addServico') document.getElementById('adminTabAddServico').style.display = 'block';
            if (target === 'gerenciarServicos') {
                document.getElementById('adminTabGerenciarServicos').style.display = 'block';
                carregarListaServicosAdmin();
            }
            if (target === 'relatorios') {
                document.getElementById('adminTabRelatorios').style.display = 'block';
                atualizarRelatoriosAdmin();
            }
        });
    });
    
    // Salvar quarto COM LIMITE DE 10
    document.getElementById('adminSalvarQuarto').addEventListener('click', () => {
        if (quartos.length >= 10) {
            alert(`❌ Limite máximo de quartos atingido! Você já possui ${quartos.length} quartos cadastrados. Exclua algum quarto antes de adicionar outro.`);
            return;
        }
        const nome = document.getElementById('adminNovoQuartoNome').value.trim();
        const preco = parseFloat(document.getElementById('adminNovoQuartoPreco').value);
        const imagem = document.getElementById('adminNovoQuartoImagem').value.trim();
        const descricao = document.getElementById('adminNovoQuartoDescricao').value.trim();
        const capacidade = document.getElementById('adminNovoQuartoCapacidade').value.trim() || 'Não informado';
        const cama = document.getElementById('adminNovoQuartoCama').value.trim() || 'Não informado';
        if (!nome || isNaN(preco) || !imagem || !descricao) { alert('Preencha todos os campos obrigatórios.'); return; }
        const novoId = 'quarto_' + Date.now();
        quartos.push({ id: novoId, nome, precoDiaria: preco, imagem, descricao, capacidade, cama });
        localStorage.setItem('quartos', JSON.stringify(quartos));
        renderizarQuartos();
        alert(`Quarto "${nome}" adicionado! Restam ${10 - quartos.length} vagas.`);
        document.getElementById('adminNovoQuartoNome').value = '';
        document.getElementById('adminNovoQuartoPreco').value = '';
        document.getElementById('adminNovoQuartoImagem').value = '';
        document.getElementById('adminNovoQuartoDescricao').value = '';
        document.getElementById('adminNovoQuartoCapacidade').value = '';
        document.getElementById('adminNovoQuartoCama').value = '';
        document.getElementById('contadorQuartosAtual').textContent = quartos.length;
        if (document.getElementById('adminTabGerenciarQuartos').style.display === 'block') carregarListaQuartosAdmin();
    });
    
    document.getElementById('adminSalvarServico').addEventListener('click', () => {
        const icone = document.getElementById('adminNovoServicoIcone').value.trim();
        const nome = document.getElementById('adminNovoServicoNome').value.trim();
        const descricao = document.getElementById('adminNovoServicoDescricao').value.trim();
        const imagem = document.getElementById('adminNovoServicoImagem').value.trim();
        if (!icone || !nome || !descricao || !imagem) { alert('Preencha todos os campos.'); return; }
        servicos.push({ icone, nome, descricao, imagem });
        localStorage.setItem('servicos', JSON.stringify(servicos));
        renderizarServicos();
        alert(`Serviço "${nome}" adicionado!`);
        document.getElementById('adminNovoServicoIcone').value = '';
        document.getElementById('adminNovoServicoNome').value = '';
        document.getElementById('adminNovoServicoDescricao').value = '';
        document.getElementById('adminNovoServicoImagem').value = '';
        if (document.getElementById('adminTabGerenciarServicos').style.display === 'block') carregarListaServicosAdmin();
    });
    
    document.getElementById('fecharAdminBtn').addEventListener('click', () => {
        areaAdmin.classList.add('oculto');
        document.getElementById('telaInicial').classList.remove('oculto');
        document.getElementById('areaLogin').classList.add('oculto');
        document.getElementById('conteudoPrincipal').classList.add('oculto');
    });
    atualizarRelatoriosAdmin();
}

function carregarListaQuartosAdmin() {
    const container = document.getElementById('listaQuartosAdmin');
    if (!container) return;
    if (quartos.length === 0) { container.innerHTML = '<p style="text-align:center; color:#64748b;">Nenhum quarto cadastrado.</p>'; return; }
    container.innerHTML = quartos.map((q) => `
        <div style="background:#f8fafc; border-radius:20px; padding:1rem; border:1px solid #e2f0ea;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1;">
                    <h3 style="color:#004d40;">${q.nome}</h3>
                    <p><strong>Preço:</strong> R$ ${q.precoDiaria}/noite</p>
                    <p><strong>Descrição:</strong> ${q.descricao.substring(0,100)}...</p>
                    <p><strong>Capacidade:</strong> ${q.capacidade} | <strong>Cama:</strong> ${q.cama}</p>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-responder-avaliacao" onclick="editarQuarto('${q.id}')">✏️ Editar</button>
                    <button class="btn-excluir-avaliacao" onclick="excluirQuarto('${q.id}')">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

function carregarListaServicosAdmin() {
    const container = document.getElementById('listaServicosAdmin');
    if (!container) return;
    if (servicos.length === 0) { container.innerHTML = '<p style="text-align:center; color:#64748b;">Nenhum serviço cadastrado.</p>'; return; }
    container.innerHTML = servicos.map((s, idx) => `
        <div style="background:#f8fafc; border-radius:20px; padding:1rem; border:1px solid #e2f0ea;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1;">
                    <h3 style="color:#004d40;">${s.icone} ${s.nome}</h3>
                    <p>${s.descricao}</p>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-responder-avaliacao" onclick="editarServico(${idx})">✏️ Editar</button>
                    <button class="btn-excluir-avaliacao" onclick="excluirServico(${idx})">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editarQuarto(id) {
    const quarto = quartos.find(q => q.id === id);
    if (!quarto) return;
    const novoNome = prompt('Editar nome do quarto:', quarto.nome);
    if (novoNome !== null) quarto.nome = novoNome;
    const novoPreco = prompt('Editar preço por noite (R$):', quarto.precoDiaria);
    if (novoPreco !== null && !isNaN(parseFloat(novoPreco))) quarto.precoDiaria = parseFloat(novoPreco);
    const novaImagem = prompt('Editar URL da imagem:', quarto.imagem);
    if (novaImagem !== null) quarto.imagem = novaImagem;
    const novaDescricao = prompt('Editar descrição:', quarto.descricao);
    if (novaDescricao !== null) quarto.descricao = novaDescricao;
    const novaCapacidade = prompt('Editar capacidade:', quarto.capacidade);
    if (novaCapacidade !== null) quarto.capacidade = novaCapacidade;
    const novaCama = prompt('Editar tipo de cama:', quarto.cama);
    if (novaCama !== null) quarto.cama = novaCama;
    localStorage.setItem('quartos', JSON.stringify(quartos));
    renderizarQuartos();
    carregarListaQuartosAdmin();
    alert('Quarto atualizado!');
}

function excluirQuarto(id) {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return;
    quartos = quartos.filter(q => q.id !== id);
    localStorage.setItem('quartos', JSON.stringify(quartos));
    renderizarQuartos();
    carregarListaQuartosAdmin();
    alert('Quarto excluído!');
}

function editarServico(index) {
    const servico = servicos[index];
    const novoIcone = prompt('Editar ícone:', servico.icone);
    if (novoIcone !== null) servico.icone = novoIcone;
    const novoNome = prompt('Editar nome do serviço:', servico.nome);
    if (novoNome !== null) servico.nome = novoNome;
    const novaDescricao = prompt('Editar descrição:', servico.descricao);
    if (novaDescricao !== null) servico.descricao = novaDescricao;
    const novaImagem = prompt('Editar URL da imagem:', servico.imagem);
    if (novaImagem !== null) servico.imagem = novaImagem;
    localStorage.setItem('servicos', JSON.stringify(servicos));
    renderizarServicos();
    carregarListaServicosAdmin();
    alert('Serviço atualizado!');
}

function excluirServico(index) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    servicos.splice(index, 1);
    localStorage.setItem('servicos', JSON.stringify(servicos));
    renderizarServicos();
    carregarListaServicosAdmin();
    alert('Serviço excluído!');
}

function atualizarRelatoriosAdmin() {
    const usuariosTotal = usuarios.length;
    const reservasTotal = reservas.length;
    const faturamento = reservas.reduce((sum, r) => sum + parseFloat(r.total), 0);
    const mediaAvaliacoes = avaliacoes.reduce((sum, a) => sum + a.estrelas, 0) / (avaliacoes.length || 1);
    document.getElementById('adminTotalUsuarios').textContent = usuariosTotal;
    document.getElementById('adminTotalReservas').textContent = reservasTotal;
    document.getElementById('adminFaturamentoTotal').innerHTML = `R$ ${faturamento.toFixed(2)}`;
    document.getElementById('adminMediaAvaliacoes').textContent = mediaAvaliacoes.toFixed(1);
    const ultimasReservasDiv = document.getElementById('adminUltimasReservas');
    if (reservas.length === 0) {
        ultimasReservasDiv.innerHTML = '<p style="text-align:center; color:#64748b;">Nenhuma reserva ainda.</p>';
    } else {
        ultimasReservasDiv.innerHTML = reservas.slice(-5).reverse().map(r => `
            <div class="reserva-item" style="margin-bottom:0.8rem; padding:1rem;">
                <div><strong>Check-in:</strong> ${r.checkin} | <strong>Check-out:</strong> ${r.checkout}</div>
                <div><strong>Noites:</strong> ${r.noites} | <strong>Total:</strong> R$ ${r.total}</div>
            </div>
        `).join('');
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
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
    document.getElementById('btnSalvarColaborador')?.addEventListener('click', () => {
        const nome = document.getElementById('novoColabNome').value;
        const email = document.getElementById('novoColabEmail').value;
        const telefone = document.getElementById('novoColabTelefone').value;
        const nivel = document.getElementById('novoColabNivel').value;
        const cargo = document.getElementById('novoColabCargo').value;
        const senha = document.getElementById('novoColabSenha').value;
        if (!nome || !email || !senha) { alert('Preencha nome, e-mail e senha.'); return; }
        colaboradores.push({ id: 'col'+Date.now(), nome, email, cargo, nivel, senha, telefone, ativo: true });
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
        carregarListaColaboradores();
        document.getElementById('formNovoColaborador').classList.add('oculto');
        mostrarToast('Colaborador cadastrado!');
    });
});

window.mostrarDetalhesQuarto = mostrarDetalhesQuarto;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.fecharModal = fecharModal;
window.selecionarPagamento = selecionarPagamento;
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