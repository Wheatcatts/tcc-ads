function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notificacao';
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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

function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        const cabecalho = document.getElementById('cabecalho');
        if (window.scrollY > 100) cabecalho.classList.add('fixo');
        else cabecalho.classList.remove('fixo');
    });
}

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

async function obterDataAtualAPI() {
    try {
        const response = await fetch(
            'https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo'
        );

        if (!response.ok) {
            throw new Error('Erro ao consultar API');
        }

        const data = await response.json();

        dataAtual = new Date(data.dateTime);

    } catch (error) {
        console.error('Erro ao obter data da API:', error);

        dataAtual = new Date();
    }

    dataAtual.setHours(0, 0, 0, 0);

    return dataAtual;
}

function fecharModal(modalId) { 
    document.getElementById(modalId).classList.add('oculto'); 
}

function abrirTermosModal() { 
    document.getElementById('modalTermos').classList.remove('oculto'); 
}

function abrirPrivacidadeModal() { 
    document.getElementById('modalPrivacidade').classList.remove('oculto'); 
}
