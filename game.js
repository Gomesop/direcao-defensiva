/**
 * Controlador do Treinamento de Direção Defensiva (6 fases)
 * www.horadaseguranca.com
 */

class DefensiveDrivingApp {
    constructor() {
        this.currentLead = null;
        this.totalScore = 0;
        this.currentPhase = 1;

        // métricas do relatório
        this.reactionTimes = [];
        this.correctDecisions = 0;
        this.totalDecisions = 0;
        this.simCrashes = 0;
        this.simResult = null;

        // fase 1
        this.p1Found = 0;
        this.p1TotalIrregulars = DEFENSIVE_DRIVING_DATA.phase1.items.filter(i => i.isIrregular).length;

        // fases 2 / 4 / 6
        this.p2Events = [];
        this.p2Index = 0;
        this.p4Events = [];
        this.p4Index = 0;
        this.p6Events = [];
        this.p6Index = 0;
        this.lives = 3;

        // fase 3
        this.p3Found = 0;
        this.p3Timer = null;
        this.p3TimeLeft = 0;
        this.p3HintsUsed = 0;

        this.pendingAdvance = false;
        this.simulator = null;

        this.initDOM();
        this.bindEvents();
    }

    /* ============================================================
       DOM
       ============================================================ */

    initDOM() {
        this.screenWelcome = document.getElementById('screen-welcome');
        this.screenGame = document.getElementById('screen-game');
        this.screenVictory = document.getElementById('screen-victory');

        this.phaseTitleEl = document.getElementById('phase-title');
        this.phaseSubtitleEl = document.getElementById('phase-subtitle');
        this.totalScoreEl = document.getElementById('total-score');
        this.playerNameEl = document.getElementById('player-name-display');
        this.livesContainer = document.getElementById('lives-container');
        this.livesHearts = document.getElementById('lives-hearts');

        this.containers = {};
        for (let i = 1; i <= 6; i++) this.containers[i] = document.getElementById(`container-phase-${i}`);

        // cadastro
        this.regName = document.getElementById('reg-name');
        this.regEmail = document.getElementById('reg-email');
        this.regCompany = document.getElementById('reg-company');
        this.setupErrorBox = document.getElementById('setup-error');

        // fase 1
        this.checklistGrid = document.getElementById('checklist-items-grid');
        this.p1Remaining = document.getElementById('p1-remaining');
        this.p1Progress = document.getElementById('p1-progress');

        // fase 2
        this.p2HazardIcon = document.getElementById('p2-hazard-icon');
        this.p2HazardTitle = document.getElementById('p2-hazard-title');
        this.p2HazardDesc = document.getElementById('p2-hazard-desc');
        this.p2Speed = document.getElementById('p2-speed');
        this.p2GaugeArc = document.getElementById('p2-gauge-arc');
        this.p2Actions = document.getElementById('p2-actions');
        this.p2RemainingEl = document.getElementById('p2-remaining');
        this.p2Hazard = document.getElementById('p2-hazard');

        // fase 3
        this.riskScene = document.getElementById('risk-scene');
        this.sceneHotspots = document.getElementById('scene-hotspots');
        this.p3TimerDisplay = document.getElementById('p3-timer-display');
        this.p3FoundEl = document.getElementById('p3-found');
        this.p3ProgressEl = document.getElementById('p3-progress');
        this.p3FoundList = document.getElementById('p3-found-list');
        this.btnP3Hint = document.getElementById('btn-p3-hint');

        // fase 4
        this.p4HazardIcon = document.getElementById('p4-hazard-icon');
        this.p4HazardTitle = document.getElementById('p4-hazard-title');
        this.p4HazardDesc = document.getElementById('p4-hazard-desc');
        this.p4Speed = document.getElementById('p4-speed');
        this.p4GaugeArc = document.getElementById('p4-gauge-arc');
        this.p4Actions = document.getElementById('p4-actions');
        this.p4RemainingEl = document.getElementById('p4-remaining');
        this.p4Scene = document.getElementById('p4-scene');
        this.weatherLayer = document.getElementById('weather-layer');
        this.p4Hazard = document.getElementById('p4-hazard');

        // fase 5 (simulador)
        this.simBriefing = document.getElementById('sim-briefing');
        this.simStage = document.getElementById('sim-stage');
        this.btnSimStart = document.getElementById('btn-sim-start');
        this.simCanvas = document.getElementById('sim-canvas');
        this.simTime = document.getElementById('sim-time');
        this.simSpeed = document.getElementById('sim-speed');
        this.simLives = document.getElementById('sim-lives');
        this.simPoints = document.getElementById('sim-points');
        this.simAlert = document.getElementById('sim-alert');

        // fase 6
        this.p6Event = document.getElementById('p6-event');
        this.p6Actions = document.getElementById('p6-actions');
        this.p6RemainingEl = document.getElementById('p6-remaining');
        this.p6Progress = document.getElementById('p6-progress');

        // modal
        this.modalFeedback = document.getElementById('modal-feedback');
        this.feedbackBadge = document.getElementById('feedback-badge');
        this.feedbackTitle = document.getElementById('feedback-title');
        this.feedbackBody = document.getElementById('feedback-body');
        this.btnCloseFeedback = document.getElementById('btn-close-feedback');
    }

    bindEvents() {
        document.getElementById('form-register').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        [this.regName, this.regEmail, this.regCompany].forEach(el => {
            if (!el) return;
            el.addEventListener('input', () => {
                el.classList.remove('input-invalid');
                if (this.setupErrorBox) this.setupErrorBox.classList.add('hidden');
            });
        });

        this.btnCloseFeedback.addEventListener('click', () => {
            this.modalFeedback.classList.add('hidden');
            const acao = this.pendingAdvance;
            this.pendingAdvance = false;
            if (typeof acao === 'function') acao();
        });

        if (this.btnP3Hint) this.btnP3Hint.addEventListener('click', () => this.usarDicaP3());
        if (this.btnSimStart) this.btnSimStart.addEventListener('click', () => this.iniciarSimulador());

        document.getElementById('btn-restart-game').addEventListener('click', () => {
            if (this.simulator) { this.simulator.destroy(); this.simulator = null; }
            this.showScreen(this.screenWelcome);
        });

        const soundBtn = document.getElementById('btn-toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                sounds.enabled = !sounds.enabled;
                soundBtn.classList.toggle('muted', !sounds.enabled);
                soundBtn.textContent = sounds.enabled ? '🔊' : '🔇';
            });
        }
    }

    som(metodo, ...args) {
        try { if (sounds && typeof sounds[metodo] === 'function') sounds[metodo](...args); } catch (e) {}
    }

    showScreen(screen) {
        [this.screenWelcome, this.screenGame, this.screenVictory].forEach(s => s.classList.add('hidden'));
        screen.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    addScore(pts) {
        this.totalScore = Math.max(0, this.totalScore + pts);
        this.totalScoreEl.textContent = this.totalScore;
        try {
            this.totalScoreEl.animate(
                [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
                { duration: 360, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
            );
        } catch (e) {}
    }

    /* ============================================================
       CADASTRO
       ============================================================ */

    mostrarErroSetup(msg, campo) {
        [this.regName, this.regEmail, this.regCompany].forEach(el => el && el.classList.remove('input-invalid'));
        if (this.setupErrorBox) {
            this.setupErrorBox.innerHTML = `⚠️ ${msg}`;
            this.setupErrorBox.classList.remove('hidden');
        }
        if (campo) {
            campo.classList.add('input-invalid');
            campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => campo.focus(), 250);
        }
        this.som('playError');
    }

    handleRegistration() {
        const nome = (this.regName.value || '').trim();
        const email = (this.regEmail.value || '').trim();
        const empresa = (this.regCompany.value || '').trim();

        if (nome.length < 3)        return this.mostrarErroSetup('Informe o seu <strong>nome completo</strong> para iniciar.', this.regName);
        if (!isEmailValido(email))  return this.mostrarErroSetup('Informe um <strong>e-mail válido</strong> (ex: nome@empresa.com.br).', this.regEmail);
        if (empresa.length < 2)     return this.mostrarErroSetup('Informe a <strong>empresa ou frota</strong>.', this.regCompany);

        if (this.setupErrorBox) this.setupErrorBox.classList.add('hidden');

        this.totalScore = 0;
        this.reactionTimes = [];
        this.correctDecisions = 0;
        this.totalDecisions = 0;
        this.simCrashes = 0;
        this.simResult = null;
        this.lives = 3;
        this.p3HintsUsed = 0;

        this.currentLead = sheetsManager.registrarInscricao(nome, email, empresa);
        this.playerNameEl.textContent = this.currentLead.name;
        this.totalScoreEl.textContent = '0';

        this.som('playClick');
        this.showScreen(this.screenGame);
        this.startPhase(1);
    }

    /* ============================================================
       CONTROLE DE FASES
       ============================================================ */

    startPhase(n) {
        this.currentPhase = n;
        this.pendingAdvance = false;

        Object.values(this.containers).forEach(c => c && c.classList.add('hidden'));

        for (let i = 1; i <= 6; i++) {
            const el = document.getElementById(`step-indicator-${i}`);
            if (el) {
                el.classList.toggle('active', i === n);
                el.classList.toggle('completed', i < n);
            }
        }

        this.livesContainer.classList.toggle('hidden', n !== 6);
        if (this.containers[n]) this.containers[n].classList.remove('hidden');

        if (n === 1) this.setupPhase1();
        if (n === 2) this.setupPhase2();
        if (n === 3) this.setupPhase3();
        if (n === 4) this.setupPhase4();
        if (n === 5) this.setupPhase5();
        if (n === 6) this.setupPhase6();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    avancar() {
        if (this.currentPhase < 6) this.startPhase(this.currentPhase + 1);
        else this.finalizar();
    }

    /* ============================================================
       FASE 1 — CHECKLIST
       ============================================================ */

    setupPhase1() {
        const data = DEFENSIVE_DRIVING_DATA.phase1;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;

        this.p1Found = 0;
        this.checklistGrid.innerHTML = '';

        embaralhar(data.items).forEach(item => {
            const card = document.createElement('div');
            card.className = 'checklist-card';
            card.innerHTML = `
                <span class="cl-icon">${item.icon}</span>
                <span class="cl-cat">${item.category}</span>
                <span class="cl-title">${item.name}</span>
                <span class="cl-mark"></span>
            `;
            card.addEventListener('click', () => this.clicarItemChecklist(item, card));
            this.checklistGrid.appendChild(card);
        });

        this.atualizarProgressoP1();
    }

    atualizarProgressoP1() {
        const pct = (this.p1Found / this.p1TotalIrregulars) * 100;
        if (this.p1Progress) this.p1Progress.style.width = `${pct}%`;
        if (this.p1Remaining) this.p1Remaining.textContent = `${this.p1Found} de ${this.p1TotalIrregulars} irregularidades`;
    }

    clicarItemChecklist(item, card) {
        if (card.classList.contains('done')) return;
        card.classList.add('done');

        if (item.isIrregular) {
            this.som('playSuccess');
            card.classList.add('ok');
            card.querySelector('.cl-mark').textContent = '✅';
            this.addScore(15);
            this.p1Found++;
            this.atualizarProgressoP1();

            if (this.p1Found >= this.p1TotalIrregulars) {
                this.pendingAdvance = () => this.avancar();
                this.feedback(true, 'Checklist concluído! 🔍',
                    `Você identificou todas as <strong>${this.p1TotalIrregulars} irregularidades</strong>. A inspeção prévia é a primeira barreira de defesa contra acidentes.`);
            }
        } else {
            this.som('playError');
            card.classList.add('bad');
            card.querySelector('.cl-mark').textContent = '⚠️';
            this.addScore(-5);
            this.feedback(false, 'Item em conformidade ⚠️',
                `<strong>${item.name}</strong> — ${item.desc}<br><br>Marcar itens regulares gera retrabalho para a manutenção. <em>−5 pontos.</em>`);
        }
    }

    /* ============================================================
       FASES 2 e 4 — DECISÕES EM CONDUÇÃO
       ============================================================ */

    setupPhase2() {
        const data = DEFENSIVE_DRIVING_DATA.phase2;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;
        this.p2Events = embaralhar(data.events);
        this.p2Index = 0;
        this.renderEventoP2();
    }

    renderEventoP2() {
        if (this.p2Index >= this.p2Events.length) {
            this.pendingAdvance = () => this.avancar();
            this.feedback(true, 'Condução urbana concluída! 🏙️',
                'Você reagiu às situações imprevisíveis da cidade mantendo velocidade e distância de segurança.');
            return;
        }

        const ev = this.p2Events[this.p2Index];
        this.p2HazardIcon.textContent = ev.icon;
        this.p2HazardTitle.textContent = ev.hazardName;
        this.p2HazardDesc.textContent = ev.desc;
        this.p2Speed.textContent = ev.speedLimit;
        this.setGauge(this.p2GaugeArc, ev.speedLimit);
        this.p2RemainingEl.textContent = `${this.p2Index + 1} de ${this.p2Events.length}`;

        this.p2Hazard.classList.remove('pop-in');
        void this.p2Hazard.offsetWidth;
        this.p2Hazard.classList.add('pop-in');

        this.renderOpcoes(this.p2Actions, ev.options, (opt) => this.escolherP2(opt));
        this.eventStart = Date.now();
        this.som('playEngineHum', ev.speedLimit / 100);
    }

    escolherP2(opt) {
        this.registrarDecisao(opt.isCorrect);
        if (opt.isCorrect) {
            this.som('playBrake');
            this.addScore(25);
            this.pendingAdvance = () => { this.p2Index++; this.renderEventoP2(); };
            this.feedback(true, 'Atitude defensiva correta! 🛡️', `${opt.feedback}<br><br><small>Tempo de reação: ${this.ultimaReacao().toFixed(1)}s</small>`);
        } else {
            this.som('playError');
            this.addScore(-5);
            this.pendingAdvance = () => { this.p2Index++; this.renderEventoP2(); };
            this.feedback(false, 'Decisão inadequada ⚠️', opt.feedback);
        }
    }

    setupPhase4() {
        const data = DEFENSIVE_DRIVING_DATA.phase4;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;
        this.p4Events = embaralhar(data.adverseEvents);
        this.p4Index = 0;
        this.renderEventoP4();
    }

    renderEventoP4() {
        if (this.p4Index >= this.p4Events.length) {
            this.pendingAdvance = () => this.avancar();
            this.feedback(true, 'Condições adversas superadas! 🌧️',
                'Você aplicou as técnicas corretas para chuva, neblina e ofuscamento. Agora é hora de assumir o volante no simulador.');
            return;
        }

        const ev = this.p4Events[this.p4Index];
        this.p4HazardIcon.textContent = ev.icon;
        this.p4HazardTitle.textContent = ev.condition;
        this.p4HazardDesc.textContent = ev.desc;
        this.p4Speed.textContent = ev.speed;
        this.setGauge(this.p4GaugeArc, ev.speed);
        this.p4RemainingEl.textContent = `${this.p4Index + 1} de ${this.p4Events.length}`;

        this.p4Scene.classList.remove('w-rain', 'w-fog', 'w-sun');
        this.p4Scene.classList.add('w-' + (ev.weather || 'rain'));
        this.montarClima(ev.weather || 'rain');

        this.p4Hazard.classList.remove('pop-in');
        void this.p4Hazard.offsetWidth;
        this.p4Hazard.classList.add('pop-in');

        this.renderOpcoes(this.p4Actions, ev.options, (opt) => this.escolherP4(opt));
        this.eventStart = Date.now();
    }

    montarClima(tipo) {
        this.weatherLayer.innerHTML = '';
        if (tipo === 'rain') {
            for (let i = 0; i < 34; i++) {
                const d = document.createElement('span');
                d.className = 'drop';
                d.style.left = Math.random() * 100 + '%';
                d.style.animationDelay = (-Math.random() * 1.2) + 's';
                d.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
                this.weatherLayer.appendChild(d);
            }
        } else if (tipo === 'fog') {
            for (let i = 0; i < 4; i++) {
                const f = document.createElement('span');
                f.className = 'fogbank f' + i;
                this.weatherLayer.appendChild(f);
            }
        } else if (tipo === 'sun') {
            const g = document.createElement('span');
            g.className = 'glare';
            this.weatherLayer.appendChild(g);
        }
    }

    escolherP4(opt) {
        this.registrarDecisao(opt.isCorrect);
        if (opt.isCorrect) {
            this.som('playSuccess');
            this.addScore(30);
            this.pendingAdvance = () => { this.p4Index++; this.renderEventoP4(); };
            this.feedback(true, 'Técnica correta! 🛡️', `${opt.feedback}<br><br><small>Tempo de reação: ${this.ultimaReacao().toFixed(1)}s</small>`);
        } else {
            this.som('playError');
            this.addScore(-5);
            this.pendingAdvance = () => { this.p4Index++; this.renderEventoP4(); };
            this.feedback(false, 'Técnica inadequada ⚠️', opt.feedback);
        }
    }

    /* Renderiza alternativas SEMPRE embaralhadas */
    renderOpcoes(container, opcoes, onPick) {
        container.innerHTML = '';
        embaralhar(opcoes).forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerHTML = `<span class="ab-letter">${String.fromCharCode(65 + i)}</span><span class="ab-text">${opt.text}</span>`;
            btn.addEventListener('click', () => {
                [...container.querySelectorAll('.action-btn')].forEach(b => b.disabled = true);
                btn.classList.add(opt.isCorrect ? 'picked-ok' : 'picked-bad');
                onPick(opt);
            });
            container.appendChild(btn);
        });
    }

    setGauge(arcEl, kmh) {
        if (!arcEl) return;
        const total = 132;
        const pct = Math.max(0, Math.min(1, kmh / 120));
        arcEl.style.strokeDashoffset = String(total - total * pct);
    }

    registrarDecisao(acertou) {
        this.totalDecisions++;
        if (acertou) this.correctDecisions++;
        if (this.eventStart) this.reactionTimes.push((Date.now() - this.eventStart) / 1000);
    }

    ultimaReacao() {
        return this.reactionTimes.length ? this.reactionTimes[this.reactionTimes.length - 1] : 0;
    }

    /* ============================================================
       FASE 3 — CAÇA AOS RISCOS
       ============================================================ */

    setupPhase3() {
        const data = DEFENSIVE_DRIVING_DATA.phase3;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;

        this.p3Found = 0;
        this.p3TimeLeft = data.timeLimit;
        this.p3TimerDisplay.textContent = this.p3TimeLeft;
        this.p3FoundList.innerHTML = '';
        this.sceneHotspots.innerHTML = '';
        this.atualizarProgressoP3();

        const todos = embaralhar([
            ...data.risks.map(r => ({ ...r, isRisk: true })),
            ...data.decoys.map(d => ({ ...d, isRisk: false }))
        ]);

        todos.forEach(el => {
            const spot = document.createElement('button');
            spot.className = 'hotspot' + (el.isRisk ? '' : ' decoy');
            spot.style.top = el.pos.top;
            spot.style.left = el.pos.left;
            spot.dataset.id = el.id;
            spot.setAttribute('aria-label', 'Elemento da cena');
            spot.innerHTML = `<span class="hs-icon">${el.icon}</span>`;
            spot.addEventListener('click', () => this.clicarHotspot(el, spot));
            this.sceneHotspots.appendChild(spot);
        });

        clearInterval(this.p3Timer);
        this.p3Timer = setInterval(() => {
            this.p3TimeLeft--;
            this.p3TimerDisplay.textContent = Math.max(0, this.p3TimeLeft);
            if (this.p3TimeLeft <= 10) this.p3TimerDisplay.parentElement.classList.add('urgent');
            if (this.p3TimeLeft <= 0) {
                clearInterval(this.p3Timer);
                this.pendingAdvance = () => this.avancar();
                this.feedback(false, 'Tempo esgotado ⏱️',
                    `Você localizou <strong>${this.p3Found} de ${DEFENSIVE_DRIVING_DATA.phase3.risks.length}</strong> riscos. Na direção real, o perigo que você não vê é o que causa o acidente.`);
            }
        }, 1000);
    }

    atualizarProgressoP3() {
        const total = DEFENSIVE_DRIVING_DATA.phase3.risks.length;
        this.p3FoundEl.textContent = `${this.p3Found} / ${total} riscos encontrados`;
        this.p3ProgressEl.style.width = `${(this.p3Found / total) * 100}%`;
    }

    clicarHotspot(el, spot) {
        if (spot.classList.contains('done')) return;

        if (el.isRisk) {
            spot.classList.add('done', 'found');
            this.som('playSuccess');
            this.addScore(20);
            this.p3Found++;
            this.atualizarProgressoP3();

            const chip = document.createElement('span');
            chip.className = 'found-chip';
            chip.innerHTML = `${el.icon} ${el.title}`;
            this.p3FoundList.appendChild(chip);

            this.feedback(true, `Risco identificado! ${el.icon}`, `<strong>${el.title}</strong><br><br>${el.desc}`);

            if (this.p3Found >= DEFENSIVE_DRIVING_DATA.phase3.risks.length) {
                clearInterval(this.p3Timer);
                const bonus = Math.max(0, this.p3TimeLeft) * 2;
                this.addScore(bonus);
                this.pendingAdvance = () => this.avancar();
                this.feedback(true, 'Todos os riscos localizados! 🎯',
                    `Percepção de risco é a base da direção defensiva.<br><br><strong>Bônus de tempo: +${bonus} pontos</strong>`);
            }
        } else {
            spot.classList.add('done', 'wrong');
            this.som('playError');
            this.addScore(-8);
            this.feedback(false, 'Este item está regular ⚠️', `<strong>${el.title}</strong><br><br>${el.desc}<br><br><em>−8 pontos.</em>`);
        }
    }

    usarDicaP3() {
        const restantes = [...this.sceneHotspots.querySelectorAll('.hotspot:not(.done):not(.decoy)')];
        if (!restantes.length) return;
        const alvo = restantes[Math.floor(Math.random() * restantes.length)];
        this.addScore(-10);
        this.p3HintsUsed++;
        alvo.classList.add('hinted');
        setTimeout(() => alvo.classList.remove('hinted'), 3000);
        this.som('playClick');
    }

    /* ============================================================
       FASE 5 — SIMULADOR
       ============================================================ */

    setupPhase5() {
        const data = DEFENSIVE_DRIVING_DATA.phase5;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;

        this.simBriefing.classList.remove('hidden');
        this.simStage.classList.add('hidden');
    }

    iniciarSimulador() {
        this.simBriefing.classList.add('hidden');
        this.simStage.classList.remove('hidden');

        // ajusta resolução do canvas ao espaço disponível
        const wrap = this.simCanvas.parentElement;
        const largura = Math.min(600, wrap.clientWidth || 600);
        this.simCanvas.width = largura;
        this.simCanvas.height = Math.round(largura * 1.25);

        if (this.simulator) this.simulator.destroy();

        this.simulator = new DrivingSimulator(this.simCanvas, {
            onHud: (h) => {
                this.simTime.textContent = h.time;
                this.simSpeed.textContent = h.speed;
                this.simLives.textContent = '❤️'.repeat(Math.max(0, h.lives)) || '—';
                this.simPoints.textContent = h.points;
                this.simSpeed.parentElement.classList.toggle('fast', h.speed > 85);
            },
            onAlert: (msg) => this.mostrarAlertaSim(msg),
            onEnd: (r) => this.finalizarSimulador(r),
            playSound: (tipo) => {
                if (tipo === 'crash') this.som('playError');
                if (tipo === 'bonus') this.som('playSuccess');
                if (tipo === 'steer') this.som('playClick');
            }
        });

        this.simulator.bindTouch(
            document.getElementById('sim-left'),
            document.getElementById('sim-right'),
            document.getElementById('sim-brake'),
            document.getElementById('sim-gas')
        );

        this.simulator.start();
        this.simStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    mostrarAlertaSim(msg) {
        this.simAlert.textContent = msg;
        this.simAlert.classList.remove('hidden');
        clearTimeout(this._alertTimer);
        this._alertTimer = setTimeout(() => this.simAlert.classList.add('hidden'), 1800);
    }

    finalizarSimulador(r) {
        this.simResult = r;
        this.simCrashes = r.crashes;
        this.addScore(r.points);

        const bem = r.crashes === 0;
        const titulo = r.motivo === 'vidas' ? 'Simulação encerrada 💥' : 'Percurso concluído! 🏁';

        this.pendingAdvance = () => this.avancar();
        this.feedback(bem, titulo, `
            <div class="sim-summary">
                <div><strong>${r.points}</strong><span>pontos no percurso</span></div>
                <div><strong>${r.safePasses}</strong><span>ultrapassagens seguras</span></div>
                <div><strong>${r.goodSlowdowns}</strong><span>reduções corretas</span></div>
                <div><strong>${r.crashes}</strong><span>colisões</span></div>
            </div>
            <p class="lead-text">${
                r.crashes === 0
                    ? 'Conduziu o trecho inteiro sem colisões — antecipação e controle de velocidade no ponto certo.'
                    : r.motivo === 'vidas'
                        ? 'As três vidas acabaram. Na via real, reduzir cedo vale mais do que desviar tarde.'
                        : 'Bom percurso. Reduzir a velocidade antes de chegar ao obstáculo amplia muito a sua margem de reação.'
            }</p>
        `);
    }

    /* ============================================================
       FASE 6 — MISSÃO FINAL
       ============================================================ */

    setupPhase6() {
        const data = DEFENSIVE_DRIVING_DATA.phase6;
        this.phaseTitleEl.textContent = data.title;
        this.phaseSubtitleEl.textContent = data.subtitle;

        this.p6Events = embaralhar(data.integratedEvents);
        this.p6Index = 0;
        this.lives = data.maxLives;
        this.atualizarVidas();
        this.renderEventoP6();
    }

    atualizarVidas() {
        if (this.livesHearts) this.livesHearts.textContent = '❤️'.repeat(Math.max(0, this.lives)) || '💀';
    }

    renderEventoP6() {
        const total = this.p6Events.length;

        if (this.lives <= 0) {
            this.pendingAdvance = () => this.finalizar();
            this.feedback(false, 'Vidas esgotadas 💔',
                'A rota foi encerrada. Reveja os fundamentos: antecipar, reduzir e sinalizar antes de reagir.');
            return;
        }

        if (this.p6Index >= total) {
            this.pendingAdvance = () => this.finalizar();
            this.feedback(true, 'Rota concluída com sucesso! 🏁',
                'Você completou a missão integrada aplicando os princípios da direção defensiva do início ao fim.');
            return;
        }

        const ev = this.p6Events[this.p6Index];
        this.p6RemainingEl.textContent = `${this.p6Index + 1} de ${total}`;
        this.p6Progress.style.width = `${(this.p6Index / total) * 100}%`;

        this.p6Event.innerHTML = `
            <div class="event-card anim-pop">
                <div class="ev-icon">${ev.icon}</div>
                <h3 class="ev-title">${ev.name}</h3>
                <p class="ev-desc">${ev.desc}</p>
            </div>
        `;

        this.renderOpcoes(this.p6Actions, ev.options, (opt) => this.escolherP6(opt));
        this.eventStart = Date.now();
    }

    escolherP6(opt) {
        this.registrarDecisao(opt.isCorrect);

        if (opt.isCorrect) {
            this.som('playSuccess');
            this.addScore(opt.points || 30);
            this.pendingAdvance = () => { this.p6Index++; this.renderEventoP6(); };
            this.feedback(true, 'Decisão correta! 🛡️', opt.feedback);
        } else {
            this.som('playError');
            this.lives--;
            this.atualizarVidas();
            this.pendingAdvance = () => { this.p6Index++; this.renderEventoP6(); };
            this.feedback(false, `Decisão perigosa — você perdeu uma vida 💔`, `${opt.feedback}<br><br><strong>Vidas restantes: ${Math.max(0, this.lives)}</strong>`);
        }
    }

    /* ============================================================
       FEEDBACK E RELATÓRIO
       ============================================================ */

    feedback(ok, titulo, msg) {
        this.feedbackTitle.textContent = titulo;
        this.feedbackTitle.className = ok ? 'modal-title text-success' : 'modal-title text-danger';
        this.feedbackBadge.textContent = ok ? 'MUITO BEM ✅' : 'ATENÇÃO ⚠️';
        this.feedbackBadge.className = ok ? 'feedback-badge badge-success' : 'feedback-badge badge-danger';
        this.feedbackBody.innerHTML = msg.trim().startsWith('<') ? msg : `<p class="lead-text">${msg}</p>`;
        this.modalFeedback.classList.remove('hidden');
    }

    calcularIndice() {
        const precisao = this.totalDecisions ? this.correctDecisions / this.totalDecisions : 0;
        const reacaoMedia = this.reactionTimes.length
            ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
            : 5;

        let indice = precisao * 60;                                  // até 60 pts por acerto
        indice += Math.max(0, 15 - Math.min(15, (reacaoMedia - 2) * 3));  // até 15 por agilidade
        indice += Math.max(0, 15 - this.simCrashes * 5);             // até 15 pelo simulador
        indice += Math.min(10, (this.p3Found / DEFENSIVE_DRIVING_DATA.phase3.risks.length) * 10); // até 10 por percepção

        return Math.max(0, Math.min(100, Math.round(indice)));
    }

    finalizar() {
        this.som('playVictory');
        clearInterval(this.p3Timer);
        if (this.simulator) { this.simulator.destroy(); this.simulator = null; }

        const indice = this.calcularIndice();
        const precisao = this.totalDecisions ? Math.round((this.correctDecisions / this.totalDecisions) * 100) : 0;
        const reacao = this.reactionTimes.length
            ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;

        let classificacao, classe;
        if (indice >= 85)      { classificacao = 'Condutor defensivo — excelente'; classe = 'rating-excellent'; }
        else if (indice >= 70) { classificacao = 'Condutor atento — bom';          classe = 'rating-good'; }
        else if (indice >= 50) { classificacao = 'Condutor em desenvolvimento';    classe = 'rating-regular'; }
        else                   { classificacao = 'Requer reciclagem do treinamento'; classe = 'rating-poor'; }

        document.getElementById('defensive-index-number').textContent = indice;
        const badge = document.getElementById('defensive-index-rating');
        badge.textContent = classificacao;
        badge.className = `index-rating-badge ${classe}`;

        document.getElementById('m-score').textContent = this.totalScore;
        document.getElementById('m-decisions').textContent = `${precisao}%`;
        document.getElementById('m-reaction').textContent = `${reacao.toFixed(1).replace('.', ',')}s`;
        document.getElementById('m-crashes').textContent = this.simCrashes;

        // recomendações
        const dicas = [];
        if (precisao < 80) dicas.push('Revise os fundamentos: antecipar o risco vale mais do que reagir a ele.');
        if (reacao > 6)    dicas.push('Trabalhe a leitura rápida da cena — quanto antes o risco é percebido, mais suave é a correção.');
        if (this.simCrashes > 0) dicas.push('No simulador, reduza a velocidade <strong>antes</strong> de chegar ao obstáculo em vez de desviar em cima dele.');
        if (this.p3Found < DEFENSIVE_DRIVING_DATA.phase3.risks.length) dicas.push('Pratique a varredura visual: olhe longe, cheque os retrovisores e observe as laterais da via.');
        if (!dicas.length) dicas.push('Desempenho exemplar em todas as fases. Mantenha a rotina de checklist e a distância de seguimento no dia a dia.');

        document.getElementById('report-tips').innerHTML =
            `<h4>📌 Recomendações</h4><ul>${dicas.map(d => `<li>${d}</li>`).join('')}</ul>`;

        sheetsManager.registrarConclusao(this.totalScore, `${classificacao} (índice ${indice})`);

        this.showScreen(this.screenVictory);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ddApp = new DefensiveDrivingApp();
});
