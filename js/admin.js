// PAINEL ADMINISTRADOR
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
                <button class="admin-tab" data-tab="gerenciarAvaliacoes" style="background:transparent; color:#004d40; border:1px solid #004d40; padding:0.6rem 1.5rem; border-radius:40px; cursor:pointer; font-weight:600;">📋 Gerenciar Avaliações</button>    
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
                        <div><label>Ícone *</label><input type="text" id="adminNovoServicoIcone" class="input-data" placeholder="Ex: 🍳" style="width:100%;"></div>
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
                        <div class="stat-card"><div class="stat-icon blue">📅</div><div class="stat-info"><span class="stat-valor" id="adminReservasFuturas">0</span><span class="stat-label">Reservas futuras (pendentes)</span></div></div>
                        <div class="stat-card"><div class="stat-icon green">🛏️</div><div class="stat-info"><span class="stat-valor" id="adminTotalQuartosReservados">0</span><span class="stat-label">Quartos reservados (total)</span></div></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
                        <h3 style="color:#004d40; margin:0;">📋 Histórico de reservas</h3>
                        <div style="display:flex; gap:0.5rem;">
                            <select id="adminFiltroReservas" class="input-data" style="width:180px; padding:0.4rem 0.8rem;">
                                <option value="todas">Todas</option>
                                <option value="ativas">Ativas</option>
                                <option value="finalizadas">Finalizadas</option>
                            </select>
                        </div>
                    </div>
                    <div id="adminUltimasReservas" style="max-height:400px; overflow-y:auto; margin-top:0.5rem;"></div>
                </div>
            </div>
            <div id="adminTabGerenciarAvaliacoes" class="admin-tab-content" style="display:none;">
                <div style="background:white; border-radius:30px; padding:2rem; box-shadow:0 8px 18px rgba(0,40,30,0.05);">
                    <h2 style="color:#004d40; margin-bottom:0.5rem;">⭐ Gerenciar Avaliações</h2>
                    <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
                        <input type="text" id="adminBuscarAvaliacao" placeholder="Buscar por nome ou comentário..." class="input-data" style="flex:1; min-width:200px;">
                        <select id="adminFiltroEstrelas" class="input-data" style="width:160px;">
                            <option value="todas">Todas as estrelas</option>
                            <option value="5">⭐⭐⭐⭐⭐ 5 estrelas</option>
                            <option value="4">⭐⭐⭐⭐ 4 estrelas</option>
                            <option value="3">⭐⭐⭐ 3 estrelas</option>
                            <option value="2">⭐⭐ 2 estrelas</option>
                            <option value="1">⭐ 1 estrela</option>
                        </select>
                        <select id="adminFiltroResposta" class="input-data" style="width:180px;">
                            <option value="todas">Com e sem resposta</option>
                            <option value="sem">Sem resposta</option>
                            <option value="com">Com resposta</option>
                        </select>
                    </div>
                    <div id="adminContadorAvaliacoes" style="color:#64748b; font-size:0.9rem; margin-bottom:1rem;"></div>
                    <div id="adminListaAvaliacoes" style="display:flex; flex-direction:column; gap:1rem;"></div>
                </div>
            </div>
        </div>
    `;
    areaAdmin.classList.remove('oculto');

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab').forEach(t => {
                t.style.background = 'transparent'; t.style.color = '#004d40'; t.style.border = '1px solid #004d40';
            });
            tab.style.background = '#004d40'; tab.style.color = 'white'; tab.style.border = 'none';
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
            if (target === 'addQuarto') { document.getElementById('adminTabAddQuarto').style.display = 'block'; document.getElementById('contadorQuartosAtual').textContent = quartos.length; }
            if (target === 'gerenciarQuartos') { document.getElementById('adminTabGerenciarQuartos').style.display = 'block'; carregarListaQuartosAdmin(); }
            if (target === 'addServico') document.getElementById('adminTabAddServico').style.display = 'block';
            if (target === 'gerenciarServicos') { document.getElementById('adminTabGerenciarServicos').style.display = 'block'; carregarListaServicosAdmin(); }
            if (target === 'relatorios') { document.getElementById('adminTabRelatorios').style.display = 'block'; atualizarRelatoriosAdmin(); }
           if (target === 'gerenciarAvaliacoes') { document.getElementById('adminTabGerenciarAvaliacoes').style.display = 'block'; carregarAvaliacoesAdmin(); }
        });
    });

    document.getElementById('adminSalvarQuarto').addEventListener('click', async () => {
        if (quartos.length >= 10) { alert(`❌ Limite máximo de quartos atingido!`); return; }
        const nome = document.getElementById('adminNovoQuartoNome').value.trim();
        const preco = parseFloat(document.getElementById('adminNovoQuartoPreco').value);
        const imagem = document.getElementById('adminNovoQuartoImagem').value.trim();
        const descricao = document.getElementById('adminNovoQuartoDescricao').value.trim();
        const capacidade = document.getElementById('adminNovoQuartoCapacidade').value.trim() || 'Não informado';
        const cama = document.getElementById('adminNovoQuartoCama').value.trim() || 'Não informado';
        if (!nome || isNaN(preco) || !imagem || !descricao) { alert('Preencha todos os campos obrigatórios.'); return; }
        try {
            const res = await fetch(`${API}/quartos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, preco_diaria: preco, imagem, descricao, capacidade, cama })
            });
            const data = await res.json();
            if (!res.ok) { alert(data.erro); return; }
            quartos.push({ ...data, precoDiaria: parseFloat(data.preco_diaria) });
            // id gerado pelo banco está em data.id
            renderizarQuartos();
            alert(`Quarto "${nome}" adicionado! Restam ${10 - quartos.length} vagas.`);
            ['adminNovoQuartoNome','adminNovoQuartoPreco','adminNovoQuartoImagem','adminNovoQuartoDescricao','adminNovoQuartoCapacidade','adminNovoQuartoCama'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('contadorQuartosAtual').textContent = quartos.length;
        } catch (err) { alert('Erro ao salvar quarto.'); }
    });

    document.getElementById('adminSalvarServico').addEventListener('click', async () => {
        const icone = document.getElementById('adminNovoServicoIcone').value.trim();
        const nome = document.getElementById('adminNovoServicoNome').value.trim();
        const descricao = document.getElementById('adminNovoServicoDescricao').value.trim();
        const imagem = document.getElementById('adminNovoServicoImagem').value.trim();
        if (!icone || !nome || !descricao || !imagem) { alert('Preencha todos os campos.'); return; }
        try {
            const res = await fetch(`${API}/servicos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ icone, nome, descricao, imagem })
            });
            const data = await res.json();
            if (!res.ok) { alert(data.erro); return; }
            servicos.push(data);
            renderizarServicos();
            alert(`Serviço "${nome}" adicionado!`);
            ['adminNovoServicoIcone','adminNovoServicoNome','adminNovoServicoDescricao','adminNovoServicoImagem'].forEach(id => document.getElementById(id).value = '');
        } catch (err) { alert('Erro ao salvar serviço.'); }
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
    container.innerHTML = quartos.map(q => `
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
    container.innerHTML = servicos.map(s => `
        <div style="background:#f8fafc; border-radius:20px; padding:1rem; border:1px solid #e2f0ea;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1;"><h3 style="color:#004d40;">${s.icone} ${s.nome}</h3><p>${s.descricao}</p></div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-responder-avaliacao" onclick="editarServico(${s.id})">✏️ Editar</button>
                    <button class="btn-excluir-avaliacao" onclick="excluirServico(${s.id})">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function editarQuarto(quartoId) {
    const id = isNaN(quartoId) ? quartoId : parseInt(quartoId);
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
    try {
        await fetch(`${API}/quartos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: quarto.nome, preco_diaria: quarto.precoDiaria, imagem: quarto.imagem, descricao: quarto.descricao, capacidade: quarto.capacidade, cama: quarto.cama })
        });
        renderizarQuartos();
        carregarListaQuartosAdmin();
        alert('Quarto atualizado!');
    } catch (err) { alert('Erro ao atualizar quarto.'); }
}

async function excluirQuarto(quartoId) {
    const id = isNaN(quartoId) ? quartoId : parseInt(quartoId);
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return;
    try {
        await fetch(`${API}/quartos/${id}`, { method: 'DELETE' });
        quartos = quartos.filter(q => q.id !== id);
        renderizarQuartos();
        carregarListaQuartosAdmin();
        alert('Quarto excluído!');
    } catch (err) { alert('Erro ao excluir quarto.'); }
}

async function editarServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    const novoIcone = prompt('Editar ícone:', servico.icone);
    if (novoIcone !== null) servico.icone = novoIcone;
    const novoNome = prompt('Editar nome do serviço:', servico.nome);
    if (novoNome !== null) servico.nome = novoNome;
    const novaDescricao = prompt('Editar descrição:', servico.descricao);
    if (novaDescricao !== null) servico.descricao = novaDescricao;
    const novaImagem = prompt('Editar URL da imagem:', servico.imagem);
    if (novaImagem !== null) servico.imagem = novaImagem;
    try {
        await fetch(`${API}/servicos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ icone: servico.icone, nome: servico.nome, descricao: servico.descricao, imagem: servico.imagem })
        });
        renderizarServicos();
        carregarListaServicosAdmin();
        alert('Serviço atualizado!');
    } catch (err) { alert('Erro ao atualizar serviço.'); }
}

async function excluirServico(id) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
        await fetch(`${API}/servicos/${id}`, { method: 'DELETE' });
        servicos = servicos.filter(s => s.id !== id);
        renderizarServicos();
        carregarListaServicosAdmin();
        alert('Serviço excluído!');
    } catch (err) { alert('Erro ao excluir serviço.'); }
}

async function atualizarRelatoriosAdmin() {
    try {
        const res = await fetch(`${API}/relatorios`);
        const data = await res.json();
        document.getElementById('adminTotalUsuarios').textContent = data.total_usuarios;
        document.getElementById('adminTotalReservas').textContent = data.total_reservas;
        document.getElementById('adminFaturamentoTotal').innerHTML = `R$ ${data.faturamento_total}`;
        document.getElementById('adminMediaAvaliacoes').textContent = data.media_avaliacoes;
        document.getElementById('adminReservasFuturas').textContent = data.reservas_futuras;
        document.getElementById('adminTotalQuartosReservados').textContent = data.total_quartos_reservados;
        await carregarReservasAdmin();

        // Listener do filtro
        const filtroEl = document.getElementById('adminFiltroReservas');
        if (filtroEl && !filtroEl.dataset.listenerAdded) {
            filtroEl.addEventListener('change', carregarReservasAdmin);
            filtroEl.dataset.listenerAdded = 'true';
        }
    } catch (err) { console.error('Erro ao carregar relatórios:', err); }
}


async function carregarAvaliacoesAdmin() {
    const container = document.getElementById('adminListaAvaliacoes');
    const contador = document.getElementById('adminContadorAvaliacoes');
    if (!container) return;
 
    container.innerHTML = '<p style="text-align:center; color:#64748b;">Carregando...</p>';
 
    try {
        const res = await fetch(`${API}/avaliacoes`);
        avaliacoes = (await res.json()).map(a => ({ ...a, nome: a.nome_autor, data: a.data_avaliacao }));
    } catch (err) {
        container.innerHTML = '<p style="text-align:center; color:#ef4444;">Erro ao carregar avaliações.</p>';
        return;
    }
 
    // Aplicar filtros
    const busca = document.getElementById('adminBuscarAvaliacao')?.value.toLowerCase() || '';
    const filtroEstrelas = document.getElementById('adminFiltroEstrelas')?.value || 'todas';
    const filtroResposta = document.getElementById('adminFiltroResposta')?.value || 'todas';
 
    let filtradas = avaliacoes.filter(a => {
        const matchBusca = !busca ||
            a.nome.toLowerCase().includes(busca) ||
            a.comentario.toLowerCase().includes(busca);
        const matchEstrelas = filtroEstrelas === 'todas' || a.estrelas === parseInt(filtroEstrelas);
        const matchResposta = filtroResposta === 'todas' ||
            (filtroResposta === 'sem' && !a.resposta) ||
            (filtroResposta === 'com' && a.resposta);
        return matchBusca && matchEstrelas && matchResposta;
    });
 
    if (contador) contador.textContent = `${filtradas.length} avaliação(ões) encontrada(s)`;
 
    if (filtradas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#64748b; padding:2rem;">Nenhuma avaliação encontrada.</p>';
        return;
    }
 
    container.innerHTML = filtradas.map(a => `
        <div style="background:#f8fafc; border-radius:20px; padding:1.2rem; border:1px solid #e2f0ea;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.5rem;">
                        <div style="width:36px; height:36px; border-radius:50%; background:#004d40; color:white; display:flex; align-items:center; justify-content:center; font-weight:700;">
                            ${a.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong style="color:#1e293b;">${a.nome}</strong>
                            <div style="font-size:0.8rem; color:#64748b;">${a.data}</div>
                        </div>
                        <div style="margin-left:auto; font-size:1rem;">${'⭐'.repeat(a.estrelas)}${'☆'.repeat(5 - a.estrelas)}</div>
                    </div>
                    <p style="color:#334155; margin-bottom:0.5rem;">"${a.comentario}"</p>
                    ${a.resposta
                        ? `<div style="background:#e8f5e9; border-left:3px solid #004d40; border-radius:0 8px 8px 0; padding:0.5rem 0.8rem; margin-top:0.5rem; font-size:0.88rem; color:#004d40;">
                               💬 <strong>Resposta:</strong> ${a.resposta}
                           </div>`
                        : `<span style="font-size:0.8rem; color:#f59e0b;">⚠️ Sem resposta</span>`
                    }
                </div>
                <div style="display:flex; flex-direction:column; gap:0.5rem; min-width:120px;">
                    <button class="btn-responder-avaliacao" onclick="responderAvaliacaoAdmin(${a.id})">
                        💬 ${a.resposta ? 'Editar resposta' : 'Responder'}
                    </button>
                    <button class="btn-excluir-avaliacao" onclick="excluirAvaliacaoAdmin(${a.id})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
 
    // Listeners dos filtros (re-renderiza ao mudar)
    ['adminBuscarAvaliacao', 'adminFiltroEstrelas', 'adminFiltroResposta'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.listenerAdded) {
            el.addEventListener('input', carregarAvaliacoesAdmin);
            el.addEventListener('change', carregarAvaliacoesAdmin);
            el.dataset.listenerAdded = 'true';
        }
    });
}
 
// ============================================================
// GERENCIAR AVALIAÇÕES (ADMIN)
// ============================================================
 

async function responderAvaliacaoAdmin(id) {
    const avaliacao = avaliacoes.find(a => a.id === id);
    const resposta = prompt('Digite sua resposta:', avaliacao?.resposta || '');
    if (resposta === null) return;
    if (!resposta.trim()) { alert('A resposta não pode ser vazia.'); return; }
    try {
        const res = await fetch(`${API}/avaliacoes/${id}/responder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resposta: resposta.trim() })
        });
        if (!res.ok) { alert('Erro ao salvar resposta.'); return; }
        carregarAvaliacoesAdmin();
        renderizarAvaliacoes();
        mostrarToast('Resposta salva!');
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}
 
async function excluirAvaliacaoAdmin(id) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) return;
    try {
        const res = await fetch(`${API}/avaliacoes/${id}`, { method: 'DELETE' });
        if (!res.ok) { alert('Erro ao excluir avaliação.'); return; }
        avaliacoes = avaliacoes.filter(a => a.id !== id);
        carregarAvaliacoesAdmin();
        renderizarAvaliacoes();
        mostrarToast('Avaliação excluída.');
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}
 
window.carregarAvaliacoesAdmin = carregarAvaliacoesAdmin;
window.responderAvaliacaoAdmin = responderAvaliacaoAdmin;
window.excluirAvaliacaoAdmin = excluirAvaliacaoAdmin;

// ============================================================
// HISTÓRICO DE RESERVAS (ADMIN)
// ============================================================

async function carregarReservasAdmin() {
    const container = document.getElementById('adminUltimasReservas');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center; color:#64748b; padding:1rem;">Carregando...</p>';

    let todasReservas = [];
    try {
        const res = await fetch(`${API}/reservas`);
        todasReservas = await res.json();
    } catch (err) {
        container.innerHTML = '<p style="text-align:center; color:#ef4444;">Erro ao carregar reservas.</p>';
        return;
    }

    const filtro = document.getElementById('adminFiltroReservas')?.value || 'todas';
    const filtradas = todasReservas.filter(r => {
        if (filtro === 'ativas') return !r.finalizado;
        if (filtro === 'finalizadas') return r.finalizado;
        return true;
    });

    if (filtradas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#64748b; padding:1rem;">Nenhuma reserva encontrada.</p>';
        return;
    }

    container.innerHTML = filtradas.map(r => `
        <div style="background:#f8fafc; border-radius:16px; padding:1rem 1.2rem; margin-bottom:0.7rem; border:1px solid ${r.finalizado ? '#bbf7d0' : '#e2f0ea'}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">
            <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                    <span style="font-weight:600; color:#1e293b;">Reserva #${r.id}</span>
                    <span style="font-size:0.75rem; padding:0.2rem 0.7rem; border-radius:20px; font-weight:600;
                        background:${r.finalizado ? '#dcfce7' : '#fef9c3'};
                        color:${r.finalizado ? '#166534' : '#854d0e'};">
                        ${r.finalizado ? '✅ Finalizada' : '⏳ Ativa'}
                    </span>
                </div>
                <div style="font-size:0.88rem; color:#475569;">
                    📅 <strong>Check-in:</strong> ${new Date(r.checkin).toLocaleDateString('pt-BR')} &nbsp;|&nbsp;
                    📅 <strong>Check-out:</strong> ${new Date(r.checkout).toLocaleDateString('pt-BR')}
                </div>
                <div style="font-size:0.88rem; color:#475569; margin-top:0.2rem;">
                    🌙 <strong>${r.noites}</strong> noite(s) &nbsp;|&nbsp; 💰 <strong>R$ ${r.total}</strong>
                </div>
            </div>
            ${!r.finalizado ? `
                <button
                    onclick="finalizarReservaAdmin(${r.id})"
                    style="background:#004d40; color:white; border:none; padding:0.5rem 1.2rem; border-radius:40px; cursor:pointer; font-weight:600; font-size:0.85rem; white-space:nowrap;">
                    ✅ Finalizar
                </button>
            ` : `
                <span style="color:#16a34a; font-size:0.85rem; font-weight:600;">Check-out realizado</span>
            `}
        </div>
    `).join('');
}

async function finalizarReservaAdmin(id) {
    if (!confirm(`Finalizar a reserva #${id}? Ela deixará de aparecer no perfil do cliente.`)) return;
    try {
        const res = await fetch(`${API}/reservas/${id}/finalizar`, { method: 'PATCH' });
        if (!res.ok) { alert('Erro ao finalizar reserva.'); return; }
        mostrarToast('Reserva finalizada com sucesso!');
        carregarReservasAdmin();
        atualizarRelatoriosAdmin(); // atualiza os cards de contagem
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
}

window.carregarReservasAdmin = carregarReservasAdmin;
window.finalizarReservaAdmin = finalizarReservaAdmin;