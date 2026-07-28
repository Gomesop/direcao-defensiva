/**
 * Registro de participantes — Direção Defensiva
 * Envia para a mesma planilha "Treinamentos incrições" dos demais treinamentos.
 * www.horadaseguranca.com
 */

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw77Qz-viys5Kd0qg6fHqGqz5sm4Pay2vJDOGmT89FdZI8BLh3hXOVwj4lfYEJx18Axvw/exec';
const NOME_TREINAMENTO = 'Direção Defensiva';

function isEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

class LeadSheetsManager {
    constructor() {
        this.currentLead = null;
    }

    registrarInscricao(nome, email, empresa) {
        this.currentLead = {
            name: String(nome || '').trim(),
            email: String(email || '').trim(),
            company: String(empresa || '').trim() || 'Não informada'
        };
        this.enviar({
            nome: this.currentLead.name,
            email: this.currentLead.email,
            modo: this.currentLead.company,
            etapa: 'Inscrição'
        });
        return this.currentLead;
    }

    registrarConclusao(pontuacao, classificacao) {
        if (!this.currentLead) return;
        this.enviar({
            nome: this.currentLead.name,
            email: this.currentLead.email,
            modo: this.currentLead.company,
            etapa: 'Conclusão',
            pontuacao: pontuacao,
            resultado: classificacao
        });
    }

    enviar(dados) {
        if (!GOOGLE_SHEETS_URL) return;
        try {
            fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: dados.nome || '',
                    email: dados.email || '',
                    data: new Date().toLocaleDateString('pt-BR'),
                    treinamento: NOME_TREINAMENTO,
                    modo: dados.modo || '',
                    etapa: dados.etapa || '',
                    pontuacao: dados.pontuacao != null ? dados.pontuacao : '',
                    resultado: dados.resultado || ''
                })
            }).catch(e => console.warn('Falha ao registrar na planilha:', e));
        } catch (e) {
            console.warn('Falha ao registrar na planilha:', e);
        }
    }
}

const sheetsManager = new LeadSheetsManager();
