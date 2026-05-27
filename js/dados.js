const API = 'http://localhost:3000';

// Variáveis globais — preenchidas pela API
let quartos = [];
let servicos = [];
let avaliacoes = [];
let usuarios = [];
let colaboradores = [];
let reservas = [];
let carrinho = [];
let chatsSistema = [];

let checkinDate = null, checkoutDate = null, diasEstadia = 0, avaliacaoAtual = 0;
let colaboradorLogado = null;
let usuarioLogado = null;
let chatAtivoId = null;
let dataAtual = new Date();

const EMAILJS_PUBLIC_KEY = 'qVyICnehnVybgSYRO';
const EMAILJS_SERVICE_ID = 'service_8lflhpm';
const EMAILJS_TEMPLATE_ID = 'template_pcvxrnq';

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

async function carregarDadosIniciais() {
    try {
        const [q, s, a, u, c] = await Promise.all([
            fetch(`${API}/quartos`).then(r => r.json()),
            fetch(`${API}/servicos`).then(r => r.json()),
            fetch(`${API}/avaliacoes`).then(r => r.json()),
            fetch(`${API}/usuarios`).then(r => r.json()),
            fetch(`${API}/colaboradores`).then(r => r.json()),
        ]);
        quartos = q.map(q => ({ ...q, precoDiaria: parseFloat(q.preco_diaria) }));
        servicos = s;
        avaliacoes = a.map(a => ({ ...a, nome: a.nome_autor, data: a.data_avaliacao }));
        usuarios = u;
        colaboradores = c;
    } catch (err) {
        console.error('Erro ao carregar dados da API:', err);
        mostrarToast('Erro ao conectar com o servidor.', 'error');
    }
}
