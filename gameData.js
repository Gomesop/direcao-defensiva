/**
 * Banco de Dados das Fases do Treinamento de Direção Defensiva
 * www.horadaseguranca.com
 */

/* Embaralha um array sem alterar o original (Fisher-Yates) */
function embaralhar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const DEFENSIVE_DRIVING_DATA = {

    /* ============================================================
       FASE 1 — CHECKLIST DO VEÍCULO
       ============================================================ */
    phase1: {
        title: "Fase 1: Checklist do Veículo",
        subtitle: "Inspecione o veículo no pátio. Marque apenas os itens IRREGULARES.",
        items: [
            { id: "p1_1",  name: "Pneu dianteiro careca",              category: "Pneus",         isIrregular: true,  icon: "🛞", desc: "Sulcos abaixo de 1,6 mm reduzem a aderência e favorecem a aquaplanagem." },
            { id: "p1_2",  name: "Farol esquerdo queimado",            category: "Iluminação",    isIrregular: true,  icon: "💡", desc: "Compromete a visibilidade noturna e a percepção do seu veículo pelos outros condutores." },
            { id: "p1_3",  name: "Retrovisor trincado",                category: "Retrovisores",  isIrregular: true,  icon: "🪞", desc: "Distorce o campo de visão e amplia os pontos cegos." },
            { id: "p1_4",  name: "Palheta do limpador ressecada",      category: "Limpador",      isIrregular: true,  icon: "🌧️", desc: "Não limpa o para-brisa adequadamente sob chuva intensa." },
            { id: "p1_5",  name: "Vazamento de óleo sob o motor",      category: "Vazamentos",    isIrregular: true,  icon: "🛢️", desc: "Risco de falha mecânica, derrapagem e princípio de incêndio." },
            { id: "p1_6",  name: "Cinto de segurança desfiado",        category: "Retenção",      isIrregular: true,  icon: "🪢", desc: "Pode romper durante uma colisão, anulando a proteção." },
            { id: "p1_7",  name: "Luz de freio queimada",              category: "Iluminação",    isIrregular: true,  icon: "🚨", desc: "Quem vem atrás não percebe a desaceleração — causa clássica de engavetamento." },
            { id: "p1_8",  name: "Licenciamento vencido",              category: "Documentação",  isIrregular: true,  icon: "📄", desc: "Infração gravíssima que impede a circulação legal do veículo." },
            { id: "p1_9",  name: "Extintor com carga vencida",         category: "Emergência",    isIrregular: true,  icon: "🧯", desc: "Equipamento sem validade não garante o combate a um princípio de incêndio." },
            { id: "p1_10", name: "Triângulo de sinalização ausente",   category: "Emergência",    isIrregular: true,  icon: "🔺", desc: "Sem ele não há como sinalizar o veículo parado na via, risco de colisão traseira." },
            { id: "p1_11", name: "Pneu traseiro calibrado",            category: "Pneus",         isIrregular: false, icon: "🛞", desc: "Item regular. Calibragem correta garante estabilidade e economia." },
            { id: "p1_12", name: "Cinto do passageiro conservado",     category: "Retenção",      isIrregular: false, icon: "🪢", desc: "Item regular. O retrator trava corretamente sob impacto." },
            { id: "p1_13", name: "Nível do fluido de freio adequado",  category: "Freios",        isIrregular: false, icon: "🛑", desc: "Item regular. O reservatório está entre as marcas mínima e máxima." },
            { id: "p1_14", name: "Seta traseira funcionando",          category: "Iluminação",    isIrregular: false, icon: "🟠", desc: "Item regular. A sinalização de conversão está operante." },
            { id: "p1_15", name: "Estepe em bom estado",               category: "Pneus",         isIrregular: false, icon: "⚙️", desc: "Item regular. Pneu reserva calibrado e com sulcos dentro do limite." }
        ]
    },

    /* ============================================================
       FASE 2 — CONDUÇÃO URBANA (1ª PESSOA)
       ============================================================ */
    phase2: {
        title: "Fase 2: Condução Urbana",
        subtitle: "Tome a decisão defensiva correta diante de cada imprevisto na cidade.",
        events: [
            {
                id: "e1",
                hazardName: "Pedestre atravessando na faixa",
                icon: "🚶",
                desc: "Um pedestre inicia a travessia na faixa sem semáforo, a 30 metros à frente.",
                speedLimit: 50,
                options: [
                    { text: "Reduzir e parar antes da faixa", isCorrect: true,  feedback: "Correto. O pedestre tem prioridade absoluta na faixa — a parada deve ser progressiva e antecipada." },
                    { text: "Manter a velocidade e buzinar",  isCorrect: false, feedback: "A buzina não transfere a preferência: o pedestre continua com prioridade e o risco de atropelamento permanece." },
                    { text: "Desviar pela faixa da esquerda", isCorrect: false, feedback: "Desviar sem checar o retrovisor pode causar colisão lateral e ainda surpreender outro pedestre." },
                    { text: "Frear bruscamente no último instante", isCorrect: false, feedback: "A frenagem tardia expõe você à colisão traseira. A direção defensiva antecipa, não reage no limite." }
                ]
            },
            {
                id: "e2",
                hazardName: "Motociclista surgindo no ponto cego",
                icon: "🏍️",
                desc: "Uma moto vem pelo corredor e muda de faixa à sua frente sem sinalizar.",
                speedLimit: 45,
                options: [
                    { text: "Reduzir e ampliar a distância de seguimento", isCorrect: true,  feedback: "Perfeito. A direção defensiva prevê a imprudência alheia e cria espaço para reagir." },
                    { text: "Acelerar para não perder a posição",          isCorrect: false, feedback: "Disputar espaço com uma moto é a receita de uma colisão lateral grave." },
                    { text: "Fechar a passagem para ensinar a lição",      isCorrect: false, feedback: "Conduta agressiva. Além de infração, coloca o motociclista em risco de morte." },
                    { text: "Manter tudo igual e confiar no reflexo",      isCorrect: false, feedback: "Reflexo não substitui distância de segurança: sem espaço, não existe tempo de frenagem." }
                ]
            },
            {
                id: "e3",
                hazardName: "Semáforo mudando para amarelo",
                icon: "🚦",
                desc: "O sinal fica amarelo com você a 20 metros do cruzamento, a 40 km/h.",
                speedLimit: 40,
                options: [
                    { text: "Reduzir e parar antes da faixa de retenção",  isCorrect: true,  feedback: "Correto. O amarelo significa atenção e parada segura, salvo quando já se está sobre o cruzamento." },
                    { text: "Acelerar para cruzar antes do vermelho",      isCorrect: false, feedback: "Clássico avanço de sinal. É a principal causa de colisões em cruzamento, muitas vezes fatais." },
                    { text: "Parar em cima da faixa de pedestres",         isCorrect: false, feedback: "Bloquear a faixa obriga o pedestre a desviar pela pista — infração e risco desnecessário." },
                    { text: "Buzinar para o carro de trás e seguir",       isCorrect: false, feedback: "A responsabilidade pela parada é sua; buzinar não elimina o risco no cruzamento." }
                ]
            },
            {
                id: "e4",
                hazardName: "Porta de veículo estacionado se abrindo",
                icon: "🚪",
                desc: "Um condutor abre a porta do carro estacionado à sua direita.",
                speedLimit: 40,
                options: [
                    { text: "Reduzir e manter 1,5 m de distância lateral", isCorrect: true,  feedback: "Excelente. Manter afastamento lateral de veículos estacionados evita o acidente de porta aberta." },
                    { text: "Desviar bruscamente para a faixa ao lado",    isCorrect: false, feedback: "Manobra brusca sem checar o retrovisor troca um risco por outro, possivelmente maior." },
                    { text: "Frear de uma só vez no último metro",         isCorrect: false, feedback: "Parada de socorro sem checar quem vem atrás gera colisão traseira." },
                    { text: "Seguir rente aos carros para ganhar espaço",  isCorrect: false, feedback: "Passar rente elimina qualquer margem de reação — é exatamente onde a porta se abre." }
                ]
            },
            {
                id: "e5",
                hazardName: "Ônibus parando no ponto à direita",
                icon: "🚌",
                desc: "Um ônibus encosta no ponto e passageiros começam a desembarcar.",
                speedLimit: 45,
                options: [
                    { text: "Reduzir e passar com folga, atento à frente do ônibus", isCorrect: true, feedback: "Correto. Pedestres costumam surgir pela frente do ônibus, fora do seu campo de visão." },
                    { text: "Ultrapassar rente ao ônibus sem reduzir",     isCorrect: false, feedback: "O ônibus é uma barreira visual: passar rente e rápido não deixa tempo de frear por quem cruza." },
                    { text: "Buzinar para os passageiros se apressarem",   isCorrect: false, feedback: "Pressionar pedestres provoca travessias apressadas e imprudentes." },
                    { text: "Colar atrás do ônibus até ele sair",          isCorrect: false, feedback: "Sem distância você perde a visão da via e fica exposto à frenagem repentina do ônibus." }
                ]
            },
            {
                id: "e6",
                hazardName: "Ciclista à direita em via estreita",
                icon: "🚲",
                desc: "Um ciclista segue à sua direita em uma via de faixa única.",
                speedLimit: 40,
                options: [
                    { text: "Aguardar o momento seguro e ultrapassar com 1,5 m", isCorrect: true, feedback: "Correto. O CTB exige afastamento lateral mínimo de 1,5 m ao ultrapassar ciclistas." },
                    { text: "Ultrapassar imediatamente pelo espaço disponível",  isCorrect: false, feedback: "Ultrapassagem apertada desequilibra o ciclista pelo deslocamento de ar e pode ser fatal." },
                    { text: "Buzinar para o ciclista encostar mais",             isCorrect: false, feedback: "Buzinar próximo assusta e desestabiliza — o ciclista tem direito à via." },
                    { text: "Seguir colado até ele sair da frente",              isCorrect: false, feedback: "Intimidação no trânsito. Sem distância, qualquer desvio do ciclista vira atropelamento." }
                ]
            }
        ]
    },

    /* ============================================================
       FASE 3 — CAÇA AOS RISCOS NA CENA
       ============================================================ */
    phase3: {
        title: "Fase 3: Identifique os Riscos",
        subtitle: "Encontre os perigos na cena de trânsito antes que o tempo acabe.",
        timeLimit: 60,
        risks: [
            { id: "r1", title: "Motorista usando o celular",        icon: "📱", pos: { top: "74%", left: "20%" }, desc: "O uso do celular multiplica por 4 o risco de acidente e cega o condutor por vários segundos." },
            { id: "r2", title: "Caminhão sem distância de seguimento", icon: "🚛", pos: { top: "74%", left: "60%" }, desc: "Sem espaço não há frenagem possível: é a origem da maioria dos engavetamentos." },
            { id: "r3", title: "Carga mal amarrada na caçamba",      icon: "📦", pos: { top: "85%", left: "38%" }, desc: "Carga solta cai na pista e provoca desvios bruscos, capotamentos e colisões." },
            { id: "r4", title: "Ultrapassagem em faixa contínua",    icon: "🚫", pos: { top: "79%", left: "85%" }, desc: "Infração gravíssima com altíssimo risco de colisão frontal." },
            { id: "r5", title: "Pneu visivelmente murcho",           icon: "🛞", pos: { top: "94%", left: "70%" }, desc: "Pressão baixa aquece o pneu, aumenta a distância de frenagem e pode estourar." },
            { id: "r6", title: "Criança próxima à pista",            icon: "🧒", pos: { top: "54%", left: "90%" }, desc: "Crianças mudam de direção sem aviso — exigem redução imediata e atenção redobrada." }
        ],
        /* Elementos da cena que NÃO são risco — clicá-los custa pontos */
        decoys: [
            { id: "d1", title: "Veículo em distância segura",     icon: "🚙", pos: { top: "64%", left: "30%" }, desc: "Este condutor mantém a distância de seguimento adequada. Não há irregularidade aqui." },
            { id: "d2", title: "Motociclista com capacete e colete", icon: "🏍️", pos: { top: "85%", left: "52%" }, desc: "Equipamento de proteção em uso e trajetória regular na faixa." },
            { id: "d3", title: "Placa de limite de velocidade",   icon: "🪧", pos: { top: "50%", left: "7%" },  desc: "Sinalização em bom estado e legível. É orientação, não risco." },
            { id: "d4", title: "Pedestre na passarela",           icon: "🚶", pos: { top: "38%", left: "48%" }, desc: "Travessia feita no local correto, sem conflito com a pista." },
            { id: "d5", title: "Carro com farol baixo aceso",     icon: "🚗", pos: { top: "64%", left: "72%" }, desc: "Uso correto do farol baixo em rodovia, conforme exige o CTB." }
        ]
    },

    /* ============================================================
       FASE 4 — CONDIÇÕES ADVERSAS
       ============================================================ */
    phase4: {
        title: "Fase 4: Condições Adversas",
        subtitle: "Chuva, neblina e pista molhada exigem técnica específica.",
        adverseEvents: [
            {
                id: "adv1",
                condition: "Aquaplanagem sob chuva intensa",
                icon: "🌊",
                desc: "A água acumulada faz os pneus perderem contato com o asfalto e o volante fica leve.",
                speed: 80,
                weather: "rain",
                options: [
                    { text: "Tirar o pé do acelerador e segurar o volante firme e reto", isCorrect: true,  feedback: "Perfeito. Na aquaplanagem não se freia nem se esterça: desacelere suavemente e espere os pneus reencontrarem o solo." },
                    { text: "Frear com força para recuperar o controle",  isCorrect: false, feedback: "Frear trava as rodas sobre a lâmina d'água e a derrapagem se torna incontrolável." },
                    { text: "Esterçar rápido para o lado seco da pista",  isCorrect: false, feedback: "Sem aderência, esterçar não muda a trajetória — e o carro roda quando o pneu volta a agarrar." },
                    { text: "Acelerar para 'furar' a poça de água",       isCorrect: false, feedback: "Acelerar amplia a lâmina sob o pneu e agrava exatamente o efeito que você quer eliminar." }
                ]
            },
            {
                id: "adv2",
                condition: "Neblina densa na serra",
                icon: "🌫️",
                desc: "A visibilidade cai para menos de 20 metros e os veículos surgem de repente.",
                speed: 60,
                weather: "fog",
                options: [
                    { text: "Reduzir e usar o farol baixo ou de neblina", isCorrect: true,  feedback: "Correto. O farol baixo ilumina o solo sem refletir na neblina; reduza e aumente a distância." },
                    { text: "Ligar o farol alto para enxergar mais longe", isCorrect: false, feedback: "A luz alta reflete nas gotículas e cria uma parede branca — você enxerga menos, não mais." },
                    { text: "Acender o pisca-alerta e continuar rodando", isCorrect: false, feedback: "O pisca-alerta em movimento indica veículo parado e confunde quem vem atrás." },
                    { text: "Seguir de perto as lanternas do carro à frente", isCorrect: false, feedback: "Usar o outro como guia elimina sua distância de frenagem: se ele parar, você bate." }
                ]
            },
            {
                id: "adv3",
                condition: "Curva fechada em pista molhada",
                icon: "↪️",
                desc: "Um caminhão em sentido contrário invade levemente o eixo da via durante a curva.",
                speed: 70,
                weather: "rain",
                options: [
                    { text: "Reduzir antes de entrar na curva e manter-se à direita", isCorrect: true, feedback: "Excelente. Toda a redução acontece na reta: dentro da curva o carro precisa estar estável." },
                    { text: "Frear com firmeza no meio da curva",         isCorrect: false, feedback: "Frear em curva sob chuva transfere o peso para a frente e joga a traseira para fora." },
                    { text: "Acelerar para sair logo da curva",           isCorrect: false, feedback: "Acelerar aumenta a força centrífuga e empurra o carro para a faixa contrária." },
                    { text: "Cortar a curva pelo lado de dentro",         isCorrect: false, feedback: "Cortar a curva invade a contramão — exatamente onde está o caminhão." }
                ]
            },
            {
                id: "adv4",
                condition: "Sol baixo no horizonte ao entardecer",
                icon: "🌇",
                desc: "O sol bate de frente no para-brisa sujo e o ofuscamento apaga a via.",
                speed: 70,
                weather: "sun",
                options: [
                    { text: "Reduzir, baixar o quebra-sol e aumentar a distância", isCorrect: true, feedback: "Correto. Ofuscamento se compensa com menos velocidade e mais espaço, nunca com o mesmo ritmo." },
                    { text: "Manter a velocidade e apertar os olhos",     isCorrect: false, feedback: "Você segue dirigindo praticamente às cegas — o tempo de reação vai a zero." },
                    { text: "Acionar o lavador e usar o limpador seco",   isCorrect: false, feedback: "Limpador em vidro seco e sujo espalha a sujeira e piora muito o ofuscamento." },
                    { text: "Colar no carro da frente para usá-lo de referência", isCorrect: false, feedback: "Sem distância, a frenagem dele vira a sua colisão." }
                ]
            }
        ]
    },

    /* ============================================================
       FASE 5 — SIMULADOR DE DIREÇÃO (JOGÁVEL)
       ============================================================ */
    phase5: {
        title: "Fase 5: Simulador de Direção",
        subtitle: "Assuma o volante: desvie, freie e mantenha distância na pista.",
        duration: 75,
        maxLives: 3
    },

    /* ============================================================
       FASE 6 — MISSÃO FINAL INTEGRADA
       ============================================================ */
    phase6: {
        title: "Fase 6: Missão Final Integrada",
        subtitle: "Rota completa combinando cidade, rodovia e clima. Cada erro custa uma vida.",
        maxLives: 3,
        integratedEvents: [
            {
                id: "f1",
                name: "Celular tocando sob chuva urbana",
                icon: "📲",
                desc: "Seu telefone toca no suporte do painel enquanto você roda a 50 km/h na chuva.",
                options: [
                    { text: "Ignorar e, se necessário, parar em local seguro para atender", isCorrect: true, points: 30, feedback: "Correto. Nenhuma ligação justifica dividir a atenção sob chuva." },
                    { text: "Atender no viva-voz sem tirar as mãos do volante", isCorrect: false, points: 0, feedback: "Mesmo no viva-voz a atenção cai: a distração é cognitiva, não apenas manual." },
                    { text: "Responder rapidamente por mensagem no semáforo",  isCorrect: false, points: 0, feedback: "Usar o telefone no semáforo é infração e retarda sua percepção quando o sinal abre." },
                    { text: "Atender segurando o aparelho junto ao ouvido",    isCorrect: false, points: 0, feedback: "Infração gravíssima, com uma das mãos fora do volante em piso escorregadio." }
                ]
            },
            {
                id: "f2",
                name: "Animal atravessando a rodovia",
                icon: "🐕",
                desc: "Um cão entra na pista a cerca de 100 metros à frente.",
                options: [
                    { text: "Reduzir progressivamente, checar o retrovisor e parar se for seguro", isCorrect: true, points: 30, feedback: "Correto. Reduzir com antecedência e observar quem vem atrás evita o pior dos dois acidentes." },
                    { text: "Desviar bruscamente sem olhar o retrovisor",  isCorrect: false, points: 0, feedback: "Desvios bruscos em rodovia causam capotamento e colisão frontal — muito mais graves." },
                    { text: "Acelerar para passar antes do animal",        isCorrect: false, points: 0, feedback: "Aumentar a velocidade reduz seu tempo de reação e agrava qualquer impacto." },
                    { text: "Buzinar e manter a velocidade",               isCorrect: false, points: 0, feedback: "A buzina pode até assustar o animal, mas para a direção errada. Reduzir é o que salva." }
                ]
            },
            {
                id: "f3",
                name: "Carga caindo do caminhão à frente",
                icon: "📦",
                desc: "Uma caixa se desprende de um caminhão a 50 metros à sua frente.",
                options: [
                    { text: "Frear progressivamente mantendo a faixa e a distância", isCorrect: true, points: 40, feedback: "Correto. A frenagem progressiva na própria faixa é mais segura do que qualquer desvio improvisado." },
                    { text: "Acelerar para passar antes que a carga caia",  isCorrect: false, points: 0, feedback: "Você entra justamente na zona de queda com menos tempo de reagir." },
                    { text: "Desviar para o acostamento sem sinalizar",     isCorrect: false, points: 0, feedback: "O acostamento pode ter veículos parados, pedestres ou piso irregular." },
                    { text: "Manter a distância atual e observar",          isCorrect: false, points: 0, feedback: "Observar sem reduzir não cria o espaço de frenagem de que você vai precisar." }
                ]
            },
            {
                id: "f4",
                name: "Fila parada logo após a curva",
                icon: "🚗",
                desc: "Ao sair de uma curva você encontra uma fila de veículos parados na rodovia.",
                options: [
                    { text: "Frear com firmeza e acionar o pisca-alerta para quem vem atrás", isCorrect: true, points: 40, feedback: "Correto. O pisca-alerta antecipa a informação para quem ainda não enxergou a fila." },
                    { text: "Frear apenas e não sinalizar",                 isCorrect: false, points: 0, feedback: "Quem vem atrás da curva não tem tempo de perceber a fila sem o seu alerta." },
                    { text: "Desviar imediatamente para o acostamento",     isCorrect: false, points: 0, feedback: "Trafegar no acostamento é infração e frequentemente há gente fora dos veículos." },
                    { text: "Buzinar para a fila andar",                    isCorrect: false, points: 0, feedback: "Não resolve nada e desvia sua atenção do veículo que se aproxima por trás." }
                ]
            }
        ]
    }
};
