async function validarLogin() {
    const loginInput = document.getElementById('loginEmailOuTelefone').value.trim();
    const senha = document.getElementById('loginSenha').value;
    if (!loginInput || !senha) { alert('Preencha e-mail/telefone e senha.'); return false; }
    if (loginInput === 'admin@gmail.com' && senha === '123456') {
        alert('Acesso administrativo apenas pela Área de Colaboradores (botão 👥 na tela).');
        return false;
    }
    try {
        const res = await fetch(`${API}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: loginInput, senha })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.erro); return false; }
        usuarioLogado = data;
        // Carregar reservas do usuário após login
        const resReservas = await fetch(`${API}/reservas/usuario/${usuarioLogado.id}`);
        reservas = await resReservas.json();
        atualizarContadorReservas();
        document.getElementById('userNameDisplay').textContent = data.nome_completo.split(' ')[0];
        document.getElementById('telaInicial').classList.add('oculto');
        document.getElementById('conteudoPrincipal').classList.remove('oculto');
        document.getElementById('areaLogin').classList.add('oculto');
        return true;
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
        return false;
    }
}

async function validarCadastro() {
    const email = document.getElementById('cadEmail').value.trim();
    const telefone = document.getElementById('cadTelefone').value.trim();
    const cpf = document.getElementById('cadCpf').value.trim();
    const genero = document.getElementById('cadGenero').value;
    const nomeCompleto = document.getElementById('cadNomeCompleto').value.trim();
    const dataNasc = document.getElementById('cadDataNasc').value;
    const cep = document.getElementById('cadCep').value.trim();
    const rua = document.getElementById('cadEnderecoRua').value.trim();
    const numero = document.getElementById('cadEnderecoNumero').value.trim();
    const complemento = document.getElementById('cadEnderecoComplemento').value.trim();
    const bairro = document.getElementById('cadBairro').value.trim();
    const cidade = document.getElementById('cadCidade').value.trim();
    const estado = document.getElementById('cadEstado').value;
    const senha = document.getElementById('cadSenha').value;

    if (!nomeCompleto || !email || !telefone || !cpf || !genero || !dataNasc || !rua || !numero || !bairro || !cidade || !estado || !senha) {
        alert('Preencha todos os campos obrigatórios.'); return false;
    }
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) { alert('CPF inválido.'); return false; }
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) { alert('Telefone inválido.'); return false; }
    if (senha.length < 6) { alert('Senha mínima 6 caracteres.'); return false; }
    if (!document.getElementById('aceitoTermos').checked) { alert('Aceite os Termos de Uso.'); return false; }

    try {
        const res = await fetch(`${API}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_completo: nomeCompleto, email, telefone, cpf, senha,
                genero, data_nascimento: dataNasc, cep, rua, numero,
                complemento: complemento || null, bairro, cidade, estado
            })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.erro); return false; }
        usuarioLogado = data;
        localStorage.setItem('usuarioLogado', JSON.stringify(data));
        reservas = [];
        atualizarContadorReservas();
        alert(`Cadastro realizado, ${nomeCompleto.split(' ')[0]}!`);
        document.getElementById('userNameDisplay').textContent = nomeCompleto.split(' ')[0];
        document.getElementById('telaInicial').classList.add('oculto');
        document.getElementById('conteudoPrincipal').classList.remove('oculto');
        document.getElementById('areaLogin').classList.add('oculto');
        document.getElementById('cadastroForm').reset();
        return true;
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
        return false;
    }
}

async function fazerRecuperacaoSenha(event) {
    event.preventDefault();
    const contato = document.getElementById('recuperacaoEmailOuTelefone').value.trim();
    if (!contato) { alert('Informe e-mail ou telefone.'); return; }
    try {
        const res = await fetch(`${API}/usuarios/recuperar-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contato })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.erro); return; }
        const resetLink = `http://localhost:5500/redefinir-senha.html?token=${data.email}`;
        const templateParams = { to_email: data.email, to_name: data.nome.split(' ')[0], reset_link: resetLink, message: `Clique para redefinir: ${resetLink}` };
        try { 
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams); alert(`✅ E-mail enviado para ${data.email}`); 
        }
        catch (e) { 
            alert(`❌ Erro: ${e.text}`); 
        }
        
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
    document.getElementById('recuperacaoEmailOuTelefone').value = '';
    ativarTab(document.getElementById('btnLoginTab'));
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