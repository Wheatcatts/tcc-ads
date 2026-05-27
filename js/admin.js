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
                t.style.background = 'transparent'; t.style.color = '#004d40'; t.style.border = '1px solid #004d40';
            });
            tab.style.background = '#004d40'; tab.style.color = 'white'; tab.style.border = 'none';
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
            if (target === 'addQuarto') { document.getElementById('adminTabAddQuarto').style.display = 'block'; document.getElementById('contadorQuartosAtual').textContent = quartos.length; }
            if (target === 'gerenciarQuartos') { document.getElementById('adminTabGerenciarQuartos').style.display = 'block'; carregarListaQuartosAdmin(); }
            if (target === 'addServico') document.getElementById('adminTabAddServico').style.display = 'block';
            if (target === 'gerenciarServicos') { document.getElementById('adminTabGerenciarServicos').style.display = 'block'; carregarListaServicosAdmin(); }
            if (target === 'relatorios') { document.getElementById('adminTabRelatorios').style.display = 'block'; atualizarRelatoriosAdmin(); }
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
        const ultimasReservasDiv = document.getElementById('adminUltimasReservas');
        if (data.ultimas_reservas.length === 0) {
            ultimasReservasDiv.innerHTML = '<p style="text-align:center; color:#64748b;">Nenhuma reserva ainda.</p>';
        } else {
            ultimasReservasDiv.innerHTML = data.ultimas_reservas.map(r => `
                <div class="reserva-item" style="margin-bottom:0.8rem; padding:1rem;">
                    <div><strong>Check-in:</strong> ${new Date(r.checkin).toLocaleDateString('pt-BR')} | <strong>Check-out:</strong> ${new Date(r.checkout).toLocaleDateString('pt-BR')}</div>
                    <div><strong>Noites:</strong> ${r.noites} | <strong>Total:</strong> R$ ${r.total}</div>
                </div>
            `).join('');
        }
    } catch (err) { console.error('Erro ao carregar relatórios:', err); }
}
