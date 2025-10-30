import { useState, useEffect } from 'react';

export default function Home() {
  const [botStatus, setBotStatus] = useState('initializing');
  const [qrImageUrl, setQrImageUrl] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchBotStatus = async () => {
      try {
        // Chama a função API no Vercel (pages/api/bot.js)
        const res = await fetch('/api/bot');
        const data = await res.json();

        setBotStatus(data.status);

        if (data.status === 'qr_code' && data.qr_url) {
          setQrImageUrl(data.qr_url);
        } else {
          setQrImageUrl(null);
        }

        // Se não estiver pronto, continua tentando (polling)
        if (data.status !== 'ready') {
          intervalId = setTimeout(fetchBotStatus, 5000); 
        }
      } catch (error) {
        setBotStatus('error');
        console.error('Erro ao buscar status do bot:', error);
        intervalId = setTimeout(fetchBotStatus, 10000);
      }
    };

    fetchBotStatus();

    // Limpeza ao desmontar o componente
    return () => clearTimeout(intervalId);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Painel de Controle do Bot CRM - Vercel</h1>
      <hr />
      
      <h2>Status Atual: <strong>{botStatus.toUpperCase().replace('_', ' ')}</strong></h2>

      {botStatus === 'qr_code' && qrImageUrl && (
        <div style={{ marginTop: '30px' }}>
          <p>
            🚨 **Escaneie o QR Code abaixo imediatamente** usando o seu celular (Configurações &gt; Aparelhos Conectados &gt; Conectar um aparelho):
            {/* A sintaxe foi corrigida aqui: ">" foi trocado por "&gt;" */}
          </p>
          <img 
            src={qrImageUrl} 
            alt="QR Code para WhatsApp Web" 
            style={{ width: '250px', height: '250px', border: '5px solid #25D366', padding: '10px' }} 
          />
          <p>
            *Lembre-se: O ambiente do Vercel é Serverless. Mantenha a aba aberta no começo. Se o bot desconectar, atualize a página para gerar um novo QR Code.
          </p>
        </div>
      )}

      {botStatus === 'ready' && (
        <p style={{ color: 'green', fontSize: '1.2em' }}>
          ✅ **BOT ATIVO!** A sessão está conectada e as funções de CRM estão prontas para responder.
        </p>
      )}

      {(botStatus === 'initializing' || botStatus === 'disconnected' || botStatus === 'auth_failure') && (
        <p style={{ color: 'orange' }}>
          🔄 Inicializando ou tentando reconectar... Por favor, aguarde alguns segundos.
        </p>
      )}
      
      {botStatus === 'error' && (
        <p style={{ color: 'red' }}>
          ❌ Ocorreu um erro ao conectar o bot. Verifique os logs do Vercel.
        </p>
      )}
    </div>
  );
}
