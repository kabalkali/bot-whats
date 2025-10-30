import { kv } from '@vercel/kv';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

// --- Variáveis de estado global (CUIDADO em ambiente serverless!)
// Tentamos manter um estado simples para fins de demonstração
let client = null;
let qrCodeData = null; // Armazena a string Base64 do QR Code
let clientStatus = 'initializing';

// --- Função para inicializar o cliente WhatsApp
const initializeClient = async () => {
    // Evita inicializar o cliente múltiplas vezes em uma única "frieza" da função
    if (client) return;

    // Usamos LocalAuth combinado com Vercel KV para persistir os dados da sessão
    // A cada inicialização, ele tentará carregar a sessão anterior (salva no KV).
    client = new Client({
        authStrategy: new LocalAuth({ clientId: "vercel-bot-session" }),
        // Você pode precisar de configurações de Puppeteer dependendo do seu ambiente
        // Ex: puppeteer: { args: ['--no-sandbox'] }
    });

    client.on('qr', async (qr) => {
        const url = await qrcode.toDataURL(qr);
        qrCodeData = url;
        clientStatus = 'qr_code';
        console.log('QR Code gerado. Acessível via API.');
    });

    client.on('ready', () => {
        clientStatus = 'ready';
        qrCodeData = null; // Limpa o QR Code
        console.log('✅ WhatsApp conectado com sucesso!');
    });

    client.on('disconnected', (reason) => {
        clientStatus = 'disconnected';
        console.log('Bot desconectado. Motivo:', reason);
        // Tente re-inicializar ou aguarde o próximo acionamento
    });
    
    client.on('auth_failure', (msg) => {
        clientStatus = 'auth_failure';
        console.error('Falha na autenticação. Novo QR code pode ser necessário.', msg);
    });

    // --- Sua Lógica do Funil de Mensagens ---
    client.on('message', async msg => {
        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000); 
            await chat.sendStateTyping(); 
            // ... (Seu código original para o Funil de Vendas) ...
            await client.sendMessage(msg.from,'Olá! [NOME] Sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Outras perguntas'); 
        } 
        // ... (Adicione os outros 'if's aqui) ...
    });
    // --- Fim da Lógica do Funil ---

    try {
        await client.initialize();
        console.log('Cliente WPP iniciado (tentando carregar sessão ou gerar QR)');
    } catch (e) {
        console.error('Erro ao inicializar o cliente WPP:', e.message);
        clientStatus = 'error';
    }
};

// Chame a inicialização na primeira vez que a função for acessada.
// Isso é o que torna o Vercel Serverless um desafio para bots.
initializeClient(); 

// A função Serverless que o Vercel executa
export default async function handler(req, res) {
    if (clientStatus === 'qr_code' && qrCodeData) {
        // Envia o QR Code para o frontend
        res.status(200).json({ status: 'qr_code', qr_url: qrCodeData });
        return;
    }

    if (clientStatus === 'ready') {
        // Sinaliza que o bot está ativo
        res.status(200).json({ status: 'ready', message: 'Bot ativo e escutando.' });
        return;
    }
    
    // Status de inicialização, falha ou desconexão
    res.status(200).json({ status: clientStatus, message: 'Aguardando estado do cliente...' });
}
