// Importação dos módulos necessários
const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");
const { Telegraf } = require("telegraf");
require("dotenv").config(); // Configuração para ler variáveis de ambiente do arquivo .env

// Conexão com o Watson Assistant
const assistant = new AssistantV2({
  version: process.env.ASSISTANT_VERSION,  // Versão da API do Watson Assistant
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_APIKEY,  // Chave de API para autenticação
  }),
  serviceUrl: process.env.ASSISTANT_URL,  // URL do serviço do Watson Assistant
});

// Criação do objeto do bot do Telegram
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);  // Token para autenticação no Telegram

// Middleware para conectar o Watson Assistant e o Telegram
const watsonResponse = (ctx) => {
  let userInput = ctx.update.message.text;  // Obtém a mensagem do usuário

  // Chama a função para enviar a mensagem ao Watson Assistant e receber uma resposta
  assistant
    .messageStateless({
      assistantId: process.env.ASSISTANT_ID,  // ID do assistente do Watson
      input: {
        message_type: "text",
        text: userInput,
      },
    })
    .then((res) => {
      showMessage(ctx, res);  // Chama a função para mostrar a resposta do Watson
    });
};

// Função para gerenciar a resposta recebida do Watson Assistant
const showMessage = (ctx, res) => {
  const response = res.result.output.generic[0];  // Obtém a resposta do Watson
  console.log(response);  // Exibe a resposta no console

  if (response.response_type === "text") {
    const message = response.text;  // Se a resposta for texto
    ctx.reply(message);  // Responde ao usuário no Telegram com o texto
  } else if (response.response_type === "option") {
    let message = `${response.title}\n\n`;

    for (let i = 0; i < response.options.length; i += 1) {
      message += `∘ ${response.options[i].label}\n`;
    }
    ctx.reply(message);
  }
};

// Escuta por mensagens de texto no Telegram
bot.on("text", (ctx) => {
  watsonResponse(ctx);  // Chama a função para lidar com a resposta do Watson
});

// Inicia o bot do Telegram
bot.launch(console.log("\x1b[36m%s\x1b[0m", "Listening to Telegram Bot..."));
