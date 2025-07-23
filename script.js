const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById("askButton");
const form = document.getElementById('form');
const aiResponse = document.getElementById('aiResponse');
const responseContent = aiResponse.querySelector('.response-content');

function exibirResposta(texto) {
    responseContent.textContent = texto;
    aiResponse.classList.remove('hidden');
}

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

//AIzaSyDvRhQgbYGpcpi_1cZcDvep7u8AJFCgZN4
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const pergunta = `
    ## Especialidade
    Você é um assistente especialista de meta do jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo para criar estratégias, builds e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não esta relacionada ao jogo, avise o usuário e não responda a pergunta.
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente para o usuário.
    - Faça pesquisas sobre a versão do jogo, e avise o usuário sobre qual versão você está falando. 

    ## Resposta
    - Não precisa economizar na resposta, foque em responder de maneira explicativa e abrangente a pergunta do usuário.
    - Responda em markdown e se possível em tópicos.
    - Não faça nenhuma saudação ou despedida, apenas responda a pergunta do usuário e não desvie do assunto.

    ## Exemplo de resposta

    O usuário fará sua pergunta pelo ${question}.

    pergunta do usuário: ${question}.

    Exemplo de resposta: Na versão 1.4.4.9 de terraria, a (resposta da pergunta) é...(as reticencias foram utilizadas apenas para indicar que a resposta continuaria, nunca utilize ela, sempre dê uma resposta completa).

    `

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools= [{
        google_search: {}
    }]

    const response= await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    const data = await response.json()
    console.log({data})
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (evento) => {
    evento.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(!apiKey && !question) {
        alert('Por favor, preencha todos os campos')
        return
    }

askButton.disabled = true
askButton.textContent = 'Perguntando...'
askButton.classList.add('loading')

try {
    // Perguntar para AI
    const text = await perguntarAI(question, game, apiKey)
    responseContent.innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')

} catch (error) {
    console.log("Erro: ", error)
}finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove("loading")
}

}
form.addEventListener('submit', enviarFormulario)

responseContent.innerHTML = ''
responseContent.innerHTML = markdownToHTML(text)
