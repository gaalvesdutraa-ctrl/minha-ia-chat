const conhecimento = JSON.parse(localStorage.getItem('iaConhecimento')) || {};
const historicoConvergente = [];

function processarEntrada() {
    const entrada = document.getElementById('entrada').value;
    const historicoDiv = document.getElementById('historico');

    if (entrada.trim() === "") return;

    const usuarioMensagem = document.createElement('div');
    usuarioMensagem.textContent = "Você: " + entrada;
    historicoDiv.appendChild(usuarioMensagem);

    const respostaIA = gerarResposta(entrada);

    const respostaMensagem = document.createElement('div');
    respostaMensagem.textContent = "IA: " + respostaIA;
    historicoDiv.appendChild(respostaMensagem);

    historicoConvergente.push({ tipo: 'usuario', texto: entrada });
    historicoConvergente.push({ tipo: 'ia', texto: respostaIA });

    if (historicoConvergente.length > 10) {
        historicoConvergente.shift();
        historicoConvergente.shift();
    }

    aprenderComInteracao(entrada, respostaIA);
    document.getElementById('entrada').value = '';
    historicoDiv.scrollTop = historicoDiv.scrollHeight;
}

function gerarResposta(entrada) {
    const palavrasChave = extrairPalavrasChave(entrada);

    // Reconhecendo intenções
    if (entrada.includes("capital") && entrada.includes("Brasil")) {
        return "A capital do Brasil é Brasília.";
    }

    let respostaEncontrada = "";

    for (const palavra of palavrasChave) {
        if (conhecimento[palavra] && conhecimento[palavra].length > 0) {
            const respostasPossiveis = conhecimento[palavra];
            respostaEncontrada = respostasPossiveis[Math.floor(Math.random() * respostasPossiveis.length)];
            break;
        }
    }

    if (!respostaEncontrada) {
        if (entrada.toLowerCase().includes("como você está")) {
            return "Estou aqui para ajudar! E você, como está?";
        } else if (entrada.toLowerCase().includes("obrigado")) {
            return "De nada! Estou sempre por aqui!";
        } else {
            return "Hmm, me conte mais para que eu possa ajudar melhor!";
        }
    }

    return respostaEncontrada;
}

function extrairPalavrasChave(texto) {
    const stopWords = ["a", "o", "as", "os", "um", "uma", "e", "de", "para", "como", "que", "é", "em", "na", "no"];
    return texto.toLowerCase()
                .replace(/[.,?!;]/g, '')
                .split(' ')
                .filter(word => word.length > 2 && !stopWords.includes(word));
}

function aprenderComInteracao(pergunta, resposta) {
    const palavrasChave = extrairPalavrasChave(pergunta);

    palavrasChave.forEach(palavra => {
        if (!conhecimento[palavra]) {
            conhecimento[palavra] = [];
        }
        if (!conhecimento[palavra].includes(resposta)) {
            conhecimento[palavra].push(resposta);
        }
    });

    localStorage.setItem('iaConhecimento', JSON.stringify(conhecimento));
}
