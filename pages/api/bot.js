import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
// Pacotes para rodar o navegador no ambiente Serverless
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core'; 

// Variaveis de estado global
let client = null;
let qrCodeData = null; 
let clientStatus = 'initializing';
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Funcao para inicializar o cliente WhatsApp ---
const initializeClient = async () => {
    if (client && (clientStatus === 'ready' || clientStatus === 'qr_code')) return;

    // --- Configuracao do Puppeteer para Vercel ---
    const executablePath = await chromium.executablePath(); 
    const puppeteerConfig = {
        executablePath: executablePath, 
        headless: chromium.headless,
        args: [
            ...chromium.args,
            '--hide-scrollbars',
            '--disable-web-security',
            '--no-sandbox',
        ],
    };
    // ---------------------------------------------
    
    client = new Client({
        // CORRECAO CRITICA: Forca o salvamento dos dados de sessao no diretorio gravavel (/tmp)
        authStrategy: new LocalAuth({ 
            clientId: "vercel-bot-session",
            dataPath: '/tmp/wwebjs_auth' 
        }),
        puppeteer: puppeteerConfig
    });

    // --- Eventos do Cliente ---
    client.on('qr', async (qr) => {
        const url = await qrcode.toDataURL(qr);
        qrCodeData = url;
        clientStatus = 'qr_code';
        console.log('QR Code gerado. Acessivel via API.');
    });

    client.on('ready', () => {
        clientStatus = 'ready';
        qrCodeData = null;
        console.log('✅ WhatsApp conectado com sucesso!');
    });

    client.on('disconnected', (reason) => {
        clientStatus = 'disconnected';
        console.log('Bot desconectado. Motivo:', reason);
    });
    
    client.on('auth_failure', (msg) => {
        clientStatus = 'auth_failure';
        console.error('Falha na autenticacao.', msg);
    });

    // --- Sua Lógica do Funil de Mensagens ---
    client.on('message', async msg => {
        const contact = await msg.getContact().catch(() => ({ pushname: 'Cliente' }));
        const name = contact.pushname || 'Cliente';
        const firstName = name.split(" ")[0];

        // 1. Funil de Início
        if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000); 
            await chat.sendStateTyping(); 
            await delay(3000); 
            await client.sendMessage(msg.from, `Olá! ${firstName} Sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Outras perguntas`);
        }

        // 2. Opção 1 - Como funciona
        if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            
            await client.sendMessage(msg.from, 'Nosso serviço oferece consultas médicas 24 horas por dia, 7 dias por semana, diretamente pelo WhatsApp.\n\nNão há carência, o que significa que você pode começar a usar nossos serviços imediatamente após a adesão.\n\nOferecemos atendimento médico ilimitado, receitas\n\nAlém disso, temos uma ampla gama de benefícios, incluindo acesso a cursos gratuitos');
            
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'COMO FUNCIONA?\nÉ muito simples.\n\n1º Passo\nFaça seu cadastro e escolha o plano que desejar.\n\n2º Passo\nApós efetuar o pagamento do plano escolhido você já terá acesso a nossa área exclusiva para começar seu atendimento na mesma hora.\n\n3º Passo\nSempre que precisar');
            
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Link para cadastro: https://site.com');
        }

        // 3. Opção 2 - Valores dos planos
        if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, '*Plano Individual:* R$22,50 por mês.\n\n*Plano Família:* R$39,90 por mês, inclui você mais 3 dependentes.\n\n*Plano TOP Individual:* R$42,50 por mês, com benefícios adicionais como\n\n*Plano TOP Família:* R$79,90 por mês, inclui você mais 3 dependentes');
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Link para cadastro: https://site.com');
        }

        // 4. Opção 3 - Benefícios
        if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Sorteio de em premios todo ano.\n\nAtendimento medico ilimitado 24h por dia.\n\nReceitas de medicamentos');
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Link para cadastro: https://site.com');
        }

        // 5. Opção 4 - Como aderir
        if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Voce pode aderir aos nossos planos diretamente pelo nosso site ou pelo WhatsApp.\n\nApós a adesão, você terá acesso imediato');
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Link para cadastro: https://site.com');
        }

        // 6. Opção 5 - Outras perguntas
        if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(msg.from, 'Se voce tiver outras duvidas ou precisar de mais informacoes, por favor, fale aqui nesse whatsapp ou visite nosso site: https://site.com ');
        }
    });
    // --- Fim da Logica do Funil ---

    try {
        await client.initialize();
        console.log('Cliente WPP iniciado (tentando carregar sessao ou gerar QR)');
    } catch (e) {
        console.error('Erro ao inicializar o cliente WPP:', e.message);
        clientStatus = 'error';
    }
};

// A funcao Serverless que o Vercel executa
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    await initializeClient(); 

    if (clientStatus === 'qr_code' && qrCodeData) {
        res.status(200).json({ status: 'qr_code', qr_url: qrCodeData });
        return;
    }

    if (clientStatus === 'ready') {
        res.status(200).json({ status: 'ready', message: 'Bot ativo e escutando.' });
        return;
    }
    
    res.status(200).json({ status: clientStatus, message: 'Aguardando estado do cliente...' });
}