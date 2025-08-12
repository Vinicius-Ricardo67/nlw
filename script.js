const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById("askButton");
const form = document.getElementById('form');
const aiResponse = document.getElementById('aiResponse');
const responseContent = aiResponse.querySelector('.response-content');
const spinner = document.getElementById('spinner');
const themeToggle = document.getElementById('themeToggle');
const btnToggleConfig = document.getElementById("mostrarConfigAvancadas");
const apiSection = document.getElementById("apiSection");
const copiarApiKeyBtn = document.getElementById("copiarApiKeyBtn");
const apiKeyDisplay = document.getElementById("apiKeyDisplay");
const gameIcon = document.getElementById('gameIcon');
const gameNameLabel = document.getElementById('gameName');

const apiKey = "AIzaSyDvRhQgbYGpcpi_1cZcDvep7u8AJFCgZN4";

function exibirResposta(texto) {
    responseContent.textContent = texto;
    aiResponse.classList.remove('hidden');
}

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

const perguntarAI = async (question, game) => {
    const model = "gemini-2.5-flash";
    const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const pergunta = `
## Especialidade
    Você é um assistente especialista de meta do jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo para criar estratégias, builds e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, avise o usuário e não responda a pergunta.
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente para o usuário.
    - Faça pesquisas sobre a versão do jogo, e avise o usuário sobre qual versão você está falando. 

    ## Resposta
    - Não precisa economizar na resposta, foque em responder de maneira explicativa e abrangente a pergunta do usuário.
    - Responda em markdown e se possível em tópicos.
    - Não faça nenhuma saudação ou despedida, apenas responda a pergunta do usuário e não desvie do assunto.
    - Ao formatar as palavras-chave, use links específicos para o jogo correto no fandom.  
      Por exemplo, para o jogo ${game}, se mencionar "Queen Bee", o link deve ser:  
      [Queen Bee](https://${game.toLowerCase().replace(/\s/g,'')}.fandom.com/wiki/Queen_Bee)  
    - Só transforme em link as palavras-chave que fazem parte do vocabulário importante do jogo (exemplo para Terraria: Queen Bee, Poções, Armaduras, Arena, etc).  
    - Use o nome exato do termo para construir o link, trocando espaços por underline (_) no URL.  
    - Não linke outras palavras que não são termos do jogo.

    ## Exemplo de resposta

    O usuário fará sua pergunta pelo ${question}.

    pergunta do usuário: ${question}.

    Exemplo de resposta: Na versão 1.4.4.9 de terraria, a (resposta da pergunta) é...(as reticências foram utilizadas apenas para indicar que a resposta continuaria, nunca utilize ela, sempre dê uma resposta completa).
    `;

    const contents = [{ role: "user", parts: [{ text: pergunta }] }];
    const tools = [{ google_search: {} }];

    const response = await fetch(baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, tools })
    });

    const data = await response.json();
    console.log({ data });

    return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (evento) => {
    evento.preventDefault();

    const game = gameSelect.value;
    const question = questionInput.value;

    if (!question || !game) {
        alert('Por favor, selecione o jogo e escreva sua pergunta');
        return;
    }

    aplicarTemaDoJogo(game);

    askButton.disabled = true;
    askButton.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
        const text = await perguntarAI(question, game);
        const rawHTML = markdownToHTML(text);
        responseContent.innerHTML = rawHTML;
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.error("Erro: ", error);
        alert("Ocorreu um erro. Verifique a chave ou tente novamente.");
    } finally {
        askButton.disabled = false;
        askButton.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
};

function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("tema") || "auto";

    if (temaSalvo === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    } else if (temaSalvo === "dark") {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.body.classList.toggle("light-mode", !prefersDark);
    }

    themeToggle.value = temaSalvo;
}

themeToggle.addEventListener("change", () => {
    const temaEscolhido = themeToggle.value;
    localStorage.setItem("tema", temaEscolhido);
    aplicarTemaSalvo();
});

function aplicarTemaDoJogo(jogoSelecionado) {
    const body = document.body;
    body.className = body.className
        .split(' ')
        .filter(c => !c.endsWith('-theme'))
        .join(' ');

    switch (jogoSelecionado.toLowerCase()) {
        case 'terraria':
            body.classList.add('terraria-theme');
            break;
        case 'minecraft dungeons':
            body.classList.add('minecraft-theme');
            break;
        case 'tboi':
        case 'the binding of issac':
            body.classList.add('tboi-theme');
            break;
        case 'fntd':
            body.classList.add('fntd-theme');
            break;
        case 'brawl stars':
            body.classList.add('brawl-theme');
            break;
    }
}

const iconesJogos = {
    terraria: './assets/icons/terraria.png',
    'minecraft dungeons': './assets/icons/minecraft.png',
    tboi: './assets/icons/tboi.png',
    fntd: './assets/icons/fntd.png',
    'brawl stars': './assets/icons/brawlstars.png'
};

function atualizarResposta(jogo, texto) {
    aiResponse.classList.remove('hidden');
    gameNameLabel.textContent = jogo;
    const key = jogo.toLowerCase();
    gameIcon.src = iconesJogos[key] || './assets/icons/default.png';
    gameIcon.alt = `Ícone do jogo ${jogo}`;
    responseContent.innerHTML = markdownToHTML(texto);
}

document.addEventListener("DOMContentLoaded", () => {
    aplicarTemaSalvo();

    if (btnToggleConfig && apiSection) {
        btnToggleConfig.addEventListener("click", () => {
            apiSection.classList.toggle("hidden");
            btnToggleConfig.textContent = apiSection.classList.contains("hidden")
                ? "Mostrar configurações avançadas ⚙"
                : "Esconder configurações avançadas ⚙";
        });
    }

    if (copiarApiKeyBtn && apiKeyDisplay) {
        copiarApiKeyBtn.addEventListener("click", () => {
            apiKeyDisplay.select();
            apiKeyDisplay.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(apiKeyDisplay.value)
                .then(() => alert("API Key copiada!"))
                .catch(() => alert("Erro ao copiar API Key"));
        });
    }

    gameSelect.addEventListener('change', (e) => {
        aplicarTemaDoJogo(e.target.value);
    });

    form.addEventListener("submit", enviarFormulario);
});

const gameColors = {
    "Terraria": "#4CAF50",
    "TBOI": "#8b0000",
    "FNTD": "#FFD700",
    "Brawl Stars": "#FF4500",
    "Minecraft Dungeons": "#8B4513"
};

const selectJogo = document.querySelector("#gameSelect");
const input = document.querySelectorAll("#gameSelect, #questionInput");
const container = document.querySelector("main section div");

function atualizarCor() {
    const jogoSelecionado = selectJogo.value;
    const cor = coresJogos[jogoSelecionado] || "var(--game-color)"

    input.forEach(input => {
        input.style.borderColor = cor;
        input.style.boxShadow = `0 0 5px ${cor}`;
    });

    container.style.borderTop = `4px solid ${cor}`;
    container.style.boxShadow = `0 -4px 15px ${cor}`;
    container.style.borderImage = `linear-gradient(90deg, ${cor}, #fff)`;
    container.style.borderImageSlice = 1;
}

selectJogo.addEventListener("change", atualizarCor);

document.addEventListener("DOMContentLoaded", atualizarCor);
