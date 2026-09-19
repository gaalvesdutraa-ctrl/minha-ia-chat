// Acessa o localStorage para carregar ou inicializar o conhecimento da IA
const conhecimento = JSON.parse(localStorage.getItem('iaConhecimento')) || {};
console.log("Conhecimento inicial da IA:", conhecimento); // Para depuração

const historicoConvergente = []; // Para manter o contexto da conversa

function processarEntrada() {
    const entrada = document.getElementById('entrada').value;
    const historicoDiv = document.getElementById('historico');

    if (entrada.trim() === "") return;

    // Adiciona a entrada do usuário ao histórico visível
    const usuarioMensagem = document.createElement('div');
    usuarioMensagem.textContent = "Você: " + entrada;
    historicoDiv.appendChild(usuarioMensagem);

    // Gera a resposta da IA
    const respostaIA = gerarResposta(entrada);

    // Adiciona a resposta da IA ao histórico visível
    const respostaMensagem = document.createElement('div');
    respostaMensagem.textContent = "IA: " + respostaIA;
    historicoDiv.appendChild(respostaMensagem);

    // Atualiza o histórico de conversação para "aprendizado" (curto prazo)
    historicoConvergente.push({ tipo: 'usuario', texto: entrada });
    historicoConvergente.push({ tipo: 'ia', texto: respostaIA });
    // Mantém o histórico com um tamanho razoável (ex: últimas 10 interações)
    if (historicoConvergente.length > 10) {
        historicoConvergente.shift(); // Remove o elemento mais antigo
        historicoConvergente.shift(); // Remove o elemento mais antigo (par de usuario/ia)
    }

    // Armazena no conhecimento (longo prazo)
    aprenderComInteracao(entrada, respostaIA);

    document.getElementById('entrada').value = '';
    historicoDiv.scrollTop = historicoDiv.scrollHeight;
}

function gerarResposta(entrada) {
    const palavrasChave = extrairPalavrasChave(entrada);
    console.log("Palavras-chave extraídas:", palavrasChave); // Para depuração

    let respostaEncontrada = "";

    // 1. Tenta encontrar uma resposta baseada nas palavras-chave no conhecimento (longo prazo)
    for (const palavra of palavrasChave) {
        if (conhecimento[palavra] && conhecimento[palavra].length > 0) {
            // Se a palavra-chave existe e tem respostas associadas
            const respostasPossiveis = conhecimento[palavra];
            respostaEncontrada = respostasPossiveis[Math.floor(Math.random() * respostasPossiveis.length)];
            console.log(`Resposta encontrada no conhecimento para "${palavra}":`, respostaEncontrada); // Depuração
            break; // Retorna a primeira correspondência que encontrar
        }
    }

    // 2. Se nenhuma correspondência forte, tenta usar o contexto do histórico (curto prazo)
    if (!respostaEncontrada && historicoConvergente.length > 0) {
        const ultimaEntradaUsuario = historicoConvergente.findLast(item => item.tipo === 'usuario'); // Pega a última interação do usuário
        
        if (ultimaEntradaUsuario) {
            console.log("Última entrada do usuário no histórico:", ultimaEntradaUsuario.texto); // Depuração
            
            // Exemplo de como usar o contexto para uma resposta mais "inteligente"
            if (ultimaEntradaUsuario.texto.toLowerCase().includes("o que é") && entrada.toLowerCase().includes("não sei")) {
                return "Tudo bem, podemos pesquisar juntos. Sobre o que gostaria de aprender?";
            }
            if (ultimaEntradaUsuario.texto.toLowerCase().includes("ajuda") && entrada.toLowerCase().includes("sim")) {
                 return "Ótimo! Com o que exatamente você precisa de ajuda?";
            }
        }
    }

    // 3. Se ainda não houver resposta, usa as respostas padrão ou perguntas iniciais
    if (!respostaEncontrada) {
        const entradaLower = entrada.toLowerCase();
        if (entradaLower.includes("olá") || entradaLower.includes("oi") || entradaLower.includes("e aí")) {
            return "Olá! Como posso ajudar você hoje?";
        } else if (entradaLower.includes("quem é você")) {
            return "Eu sou um assistente de IA em desenvolvimento, criado para te ajudar a programar!";
        } else if (entradaLower.includes("o que você faz")) {
            return "Posso te ajudar com dúvidas de programação, sugerir códigos ou apenas conversar. O que você precisa?";
        } else if (entradaLower.includes("ajuda")) {
            return "Claro! Com o que você precisa de ajuda especificamente?";
        } else if (entradaLower.includes("programar") || entradaLower.includes("código")) {
            return "Programar é uma arte! Que tipo de programação você faz ou qual linguagem te interessa?";
        }
        
        // Se ainda não encontrou nada, cai na resposta genérica de não entendimento
        return "Hmm, não tenho certeza. Você pode me dar mais detalhes ou perguntar de outra forma?";
    }

    return respostaEncontrada;
}

function extrairPalavrasChave(texto) {
    const stopWords = ["a", "o", "as", "os", "um", "uma", "uns", "umas", "e", "ou", "mas", "se", "para", "de", "do", "da", "em", "no", "na", "é", "que", "eu", "você", "ele", "ela", "nós", "vocês", "eles", "elas", "meu", "minha", "seu", "sua", "nosso", "nossa", "meus", "minhas", "seus", "suas", "nossos", "nossas", "com", "por", "para", "em", "onde", "quando", "como", "quem", "o que", "por que", "qual", "quais", "quanto", "quantos", "quantas", "fazer", "pode", "poderia", "ser", "estar", "ter", "ir", "dizer", "querer", "saber", "ir", "vir", "ver", "dar", "falar", "começar", "parar", "ajudar", "gostaria", "preciso", "será", "está", "estou", "sou", "estive", "tem", "tenho", "faz", "quero", "vou"];
    
    const palavras = texto.toLowerCase()
                        .replace(/[.,?!;:"'(){}\[\]<>|=+\-*/&%$#@~`^]/g, '') // Remove mais caracteres especiais
                        .split(/\s+/) // Divide em palavras por qualquer espaço
                        .filter(word => word.length > 2 && !stopWords.includes(word)); // Filtra stop words e palavras curtas
    
    // Adiciona algumas palavras-chave importantes se não forem filtradas (ex: JS)
    if (texto.toLowerCase().includes("js") && !palavras.includes("js")) palavras.push("js");
    if (texto.toLowerCase().includes("ia") && !palavras.includes("ia")) palavras.push("ia");

    return palavras;
}


function aprenderComInteracao(pergunta, resposta) {
    const palavrasChavePergunta = extrairPalavrasChave(pergunta);
    const palavrasChaveResposta = extrairPalavrasChave(resposta); // Também podemos extrair da resposta da IA para mais associações

    // Aprende com as palavras-chave da pergunta do usuário
    palavrasChavePergunta.forEach(palavra => {
        if (!conhecimento[palavra]) {
            conhecimento[palavra] = [];
        }
        // Adiciona a resposta da IA, mas evita duplicatas
        if (!conhecimento[palavra].includes(resposta)) {
            conhecimento[palavra].push(resposta);
        }
    });

    // Opcional: Aprende a associar a resposta da IA com suas próprias palavras-chave
    // Isso pode criar um loop se não for bem controlado, então vamos deixar mais focado na pergunta do usuário por enquanto.
    /*
    palavrasChaveResposta.forEach(palavra => {
        if (!conhecimento[palavra]) {
            conhecimento[palavra] = [];
        }
        if (!conhecimento[palavra].includes(pergunta)) { // Associa a palavra da resposta com a pergunta que a gerou
            conhecimento[palavra].push(pergunta);
        }
    });
    */

    console.log("Conhecimento atualizado:", conhecimento); // Para depuração
    localStorage.setItem('iaConhecimento', JSON.stringify(conhecimento));
}

// Para testes: limpa o conhecimento da IA
function resetarConhecimento() {
    localStorage.removeItem('iaConhecimento');
    window.location.reload(); // Recarrega a página para aplicar a mudança
}

// Opcional: Adicionar um botão no HTML para resetar o conhecimento.
// <button onclick="resetarConhecimento()">Resetar Conhecimento da IA</button>