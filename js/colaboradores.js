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

async function loginColaborador(e) {
    e.preventDefault();
    const email = document.getElementById('colabEmail').value.trim();
    const senha = document.getElementById('colabSenha').value;

    if (email === 'admin@gmail.com' && senha === '123456') {
        abrirPainelAdministrador();
        document.getElementById('areaColaboradores').classList.add('oculto');
        document.getElementById('colaboradorLoginForm').reset();
        return;
    }

    try {
        const res = await fetch(`${API}/colaboradores/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        if (!res.ok) { mostrarToast(data.erro, 'error'); return; }
        colaboradorLogado = data;
        document.getElementById('colaboradorLogin').classList.add('oculto');
        document.getElementById('colaboradorPainel').classList.remove('oculto');
        carregarDadosColaborador();
        document.getElementById('colaboradorLoginForm').reset();
        mostrarToast(`Bem-vindo, ${data.nome}!`);
    } catch (err) {
        mostrarToast('Erro ao conectar com o servidor.', 'error');
    }
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

async function atualizarDashboard() {
    try {
        const res = await fetch(`${API}/dashboard`);
        const data = await res.json();
        document.getElementById('dashUsuarios').textContent = data.usuarios;
        document.getElementById('dashReservas').textContent = data.reservas;
        document.getElementById('dashAvaliacoes').textContent = data.avaliacoes;
        document.getElementById('dashChats').textContent = data.chats;
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
    }
}

async function carregarAvaliacoesPainel() {
    const container = document.getElementById('avaliacoesContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API}/avaliacoes`);
        avaliacoes = (await res.json()).map(a => ({ ...a, nome: a.nome_autor, data: a.data_avaliacao }));
    } catch (err) {
        console.error('Erro ao carregar avaliações:', err);
        return;
    }
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
    container.innerHTML = filtradas.map(a => `
        <div class="avaliacao-card-colab">
            <div class="avaliacao-card-header">
                <div class="avaliacao-card-autor">
                    <div class="avaliacao-autor-avatar">${a.nome.charAt(0).toUpperCase()}</div>
                    <div><strong>${a.nome}</strong><div class="avaliacao-estrelas-display">${'⭐'.repeat(a.estrelas)}${'☆'.repeat(5-a.estrelas)}</div></div>
                </div>
                <span>${a.data}</span>
            </div>
            <p class="avaliacao-card-comentario">"${a.comentario}"</p>
            ${a.resposta ? `<p style="color:#004d40;font-style:italic;margin-top:0.5rem;">💬 Resposta: ${a.resposta}</p>` : ''}
            <div class="avaliacao-card-acoes">
                <button class="btn-acao-avaliacao btn-responder" onclick="responderAvaliacao(${a.id})">💬 Responder</button>
                <button class="btn-acao-avaliacao btn-excluir" onclick="excluirAvaliacao(${a.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

async function excluirAvaliacao(id) {
    if (!confirm('Excluir esta avaliação?')) return;
    try {
        await fetch(`${API}/avaliacoes/${id}`, { method: 'DELETE' });
        avaliacoes = avaliacoes.filter(a => a.id !== id);
        carregarAvaliacoesPainel();
        renderizarAvaliacoes();
        mostrarToast('Avaliação excluída.');
    } catch (err) {
        mostrarToast('Erro ao excluir avaliação.', 'error');
    }
}

async function responderAvaliacao(id) {
    const resposta = prompt('Digite sua resposta:');
    if (!resposta) return;
    try {
        const res = await fetch(`${API}/avaliacoes/${id}/responder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resposta })
        });
        const data = await res.json();
        const idx = avaliacoes.findIndex(a => a.id === id);
        if (idx !== -1) { avaliacoes[idx].resposta = data.resposta; avaliacoes[idx].resposta_data = data.resposta_data; }
        carregarAvaliacoesPainel();
        renderizarAvaliacoes();
        mostrarToast('Resposta enviada.');
    } catch (err) {
        mostrarToast('Erro ao enviar resposta.', 'error');
    }
}

async function carregarContatosChat() {
    const container = document.getElementById('chatContactsList');
    if (!container) return;
    try {
        const res = await fetch(`${API}/usuarios`);
        usuarios = await res.json();
    } catch (err) {
        console.error('Erro ao carregar usuários:', err);
    }
    if (usuarios.length === 0) {
        container.innerHTML = '<div style="padding:1rem;text-align:center;">Nenhum usuário ainda.</div>';
        return;
    }
    container.innerHTML = usuarios.map(u => `
        <div class="chat-contact-item" onclick="abrirChatUsuario('${u.email}')">
            <div class="chat-contact-avatar">${u.nome_completo.charAt(0).toUpperCase()}</div>
            <div class="chat-contact-info">
                <div class="chat-contact-nome">${u.nome_completo}</div>
                <div class="chat-contact-preview">${u.email}</div>
            </div>
        </div>
    `).join('');
}

async function abrirChatUsuario(emailUsuario) {
    chatAtivoId = emailUsuario;
    const container = document.getElementById('chatActiveContainer');
    if (!container) return;
    const usuario = usuarios.find(u => u.email === emailUsuario);
    if (!usuario) return;
    try {
        const res = await fetch(`${API}/chats/${encodeURIComponent(emailUsuario)}`);
        const mensagens = await res.json();
        container.innerHTML = `
            <div class="chat-main-header">
                <div class="chat-contact-avatar" style="width:40px;height:40px;">${usuario.nome_completo.charAt(0).toUpperCase()}</div>
                <div><strong>${usuario.nome_completo}</strong><br><span style="font-size:0.8rem;">${usuario.email}</span></div>
            </div>
            <div class="chat-messages" id="chatMessagesArea">
                ${mensagens.map(msg => `
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
    } catch (err) {
        console.error('Erro ao carregar chat:', err);
    }
}

async function enviarMensagemChat(emailUsuario) {
    const input = document.getElementById('chatInputMensagem');
    const texto = input.value.trim();
    if (!texto) return;
    try {
        await fetch(`${API}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_email: emailUsuario, remetente: 'colaborador', texto })
        });
        input.value = '';
        abrirChatUsuario(emailUsuario);
    } catch (err) {
        mostrarToast('Erro ao enviar mensagem.', 'error');
    }
}

async function carregarListaColaboradores() {
    const container = document.getElementById('colaboradoresListContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API}/colaboradores`);
        colaboradores = await res.json();
    } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
    }
    container.innerHTML = colaboradores.filter(c => c.ativo).map(colab => `
        <div class="colaborador-table-row">
            <div class="colaborador-table-nome"><span>👤</span> ${colab.nome}</div>
            <span>${colab.email}</span>
            <span>${colab.cargo}</span>
            <span><span class="nivel-badge ${colab.nivel === 'superior' ? 'nivel-superior' : 'nivel-colaborador'}">${colab.nivel === 'superior' ? 'Superior' : 'Colaborador'}</span></span>
            <span><button class="btn-remover-colaborador" onclick="removerColaborador(${colab.id})">Remover</button></span>
        </div>
    `).join('');
}

async function removerColaborador(id) {
    if (!confirm('Remover este colaborador?')) return;
    try {
        await fetch(`${API}/colaboradores/${id}/desativar`, { method: 'PATCH' });
        colaboradores = colaboradores.filter(c => c.id !== id);
        carregarListaColaboradores();
        mostrarToast('Colaborador removido.');
    } catch (err) {
        mostrarToast('Erro ao remover colaborador.', 'error');
    }
}

async function salvarNovoColaborador() {
    const nome = document.getElementById('novoColabNome').value.trim();
    const email = document.getElementById('novoColabEmail').value.trim();
    const telefone = document.getElementById('novoColabTelefone').value.trim();
    const nivel = document.getElementById('novoColabNivel').value;
    const cargo = document.getElementById('novoColabCargo').value.trim();
    const senha = document.getElementById('novoColabSenha').value;
    if (!nome || !email || !senha) { alert('Preencha nome, e-mail e senha.'); return; }
    try {
        const res = await fetch(`${API}/colaboradores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, cargo, nivel, senha, telefone })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.erro); return; }
        colaboradores.push(data);
        carregarListaColaboradores();
        document.getElementById('formNovoColaborador').classList.add('oculto');
        mostrarToast('Colaborador cadastrado!');
    } catch (err) {
        mostrarToast('Erro ao cadastrar colaborador.', 'error');
    }
}
