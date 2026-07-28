/**
 * Simulador de Direção — Fase 5
 * Pista de 3 faixas com obstáculos, frenagem e desvio.
 * www.horadaseguranca.com
 */

class DrivingSimulator {
    constructor(canvas, opts = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.onEnd = opts.onEnd || function () {};
        this.onHud = opts.onHud || function () {};
        this.onAlert = opts.onAlert || function () {};
        this.playSound = opts.playSound || function () {};

        this.W = canvas.width;
        this.H = canvas.height;

        this.lanes = 3;
        this.roadLeft = 60;
        this.roadRight = this.W - 60;
        this.roadW = this.roadRight - this.roadLeft;
        this.laneW = this.roadW / this.lanes;

        this.reset();
        this.bindInput();
    }

    laneX(i) { return this.roadLeft + this.laneW * (i + 0.5); }

    reset() {
        this.running = false;
        this.duration = 75;
        this.timeLeft = this.duration;

        this.lane = 1;
        this.carX = this.laneX(1);
        this.carY = this.H - 130;

        this.speed = 60;          // km/h exibido
        this.minSpeed = 20;
        this.maxSpeed = 110;
        this.accel = false;
        this.brake = false;

        this.lives = 3;
        this.points = 0;
        this.crashes = 0;
        this.safePasses = 0;
        this.goodSlowdowns = 0;

        this.obstacles = [];
        this.spawnTimer = 0;
        this.roadOffset = 0;
        this.invuln = 0;
        this.shake = 0;
        this.lastTs = 0;
    }

    bindInput() {
        this.keyDown = (e) => {
            if (!this.running) return;
            const k = e.key.toLowerCase();
            if (k === 'arrowleft'  || k === 'a') { this.moveLane(-1); e.preventDefault(); }
            if (k === 'arrowright' || k === 'd') { this.moveLane(1);  e.preventDefault(); }
            if (k === 'arrowdown'  || k === 's' || k === ' ') { this.brake = true; e.preventDefault(); }
            if (k === 'arrowup'    || k === 'w') { this.accel = true; e.preventDefault(); }
        };
        this.keyUp = (e) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowdown' || k === 's' || k === ' ') this.brake = false;
            if (k === 'arrowup'   || k === 'w') this.accel = false;
        };
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);
    }

    bindTouch(btnLeft, btnRight, btnBrake, btnGas) {
        const hold = (el, on, off) => {
            if (!el) return;
            const start = (e) => { e.preventDefault(); on(); };
            const end   = (e) => { e.preventDefault(); if (off) off(); };
            el.addEventListener('pointerdown', start);
            el.addEventListener('pointerup', end);
            el.addEventListener('pointerleave', end);
            el.addEventListener('pointercancel', end);
        };
        if (btnLeft)  btnLeft.addEventListener('pointerdown',  (e) => { e.preventDefault(); this.moveLane(-1); });
        if (btnRight) btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); this.moveLane(1); });
        hold(btnBrake, () => this.brake = true, () => this.brake = false);
        hold(btnGas,   () => this.accel = true, () => this.accel = false);
    }

    destroy() {
        this.running = false;
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);
    }

    moveLane(dir) {
        if (!this.running) return;
        const novo = Math.max(0, Math.min(this.lanes - 1, this.lane + dir));
        if (novo !== this.lane) {
            this.lane = novo;
            this.playSound('steer');
        }
    }

    start() {
        this.reset();
        this.running = true;
        this.lastTs = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    /* ---------- Obstáculos ---------- */

    spawn() {
        const tipos = [
            { kind: 'car',        icon: '🚗', label: 'Veículo à frente',   vulner: false, w: 58, h: 96, rel: 0.45 },
            { kind: 'truck',      icon: '🚚', label: 'Caminhão lento',      vulner: false, w: 66, h: 118, rel: 0.35 },
            { kind: 'pedestrian', icon: '🚶', label: 'Pedestre na pista',   vulner: true,  w: 46, h: 62, rel: 0.15 },
            { kind: 'cyclist',    icon: '🚲', label: 'Ciclista na faixa',   vulner: true,  w: 50, h: 70, rel: 0.30 },
            { kind: 'hole',       icon: '🕳️', label: 'Buraco no asfalto',   vulner: false, w: 62, h: 46, rel: 0.0 },
            { kind: 'cone',       icon: '🚧', label: 'Obra na pista',       vulner: false, w: 54, h: 60, rel: 0.0 }
        ];
        const t = tipos[Math.floor(Math.random() * tipos.length)];
        const lane = Math.floor(Math.random() * this.lanes);

        // evita bloquear as três faixas ao mesmo tempo
        const proximos = this.obstacles.filter(o => o.y > -260 && o.y < 40);
        if (proximos.length >= 2 && proximos.every(o => o.lane !== lane) && Math.random() < 0.8) return;

        this.obstacles.push({
            ...t,
            lane,
            y: -140,
            scored: false,
            slowScored: false,
            warned: false
        });
    }

    /* ---------- Loop ---------- */

    loop(ts) {
        if (!this.running) return;
        const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
        this.lastTs = ts;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // tempo
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.finish('tempo'); return; }

        // velocidade
        if (this.brake)      this.speed -= 55 * dt;
        else if (this.accel) this.speed += 32 * dt;
        else                 this.speed += (60 - this.speed) * 0.35 * dt;
        this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.speed));

        // posição lateral suave
        const alvo = this.laneX(this.lane);
        this.carX += (alvo - this.carX) * Math.min(1, 10 * dt);

        // pista rolando
        const fator = this.speed / 60;
        this.roadOffset = (this.roadOffset + 420 * fator * dt) % 90;

        // spawn
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawn();
            this.spawnTimer = Math.max(0.55, 1.5 - (this.speed - 40) / 90);
        }

        if (this.invuln > 0) this.invuln -= dt;
        if (this.shake > 0)  this.shake -= dt;

        // obstáculos
        const carTop = this.carY - 50, carBottom = this.carY + 50;
        for (const o of this.obstacles) {
            // velocidade relativa: carros andam, buracos ficam parados
            o.y += (420 * fator * (1 - o.rel)) * dt;

            const dist = this.carY - o.y;

            // aviso de aproximação em vulneráveis
            if (o.vulner && !o.warned && dist < 340 && dist > 60) {
                o.warned = true;
                this.onAlert(`⚠️ ${o.label} à frente — reduza a velocidade!`);
            }

            // bônus por reduzir perto de vulnerável
            if (o.vulner && !o.slowScored && dist < 260 && dist > 40 && this.speed < 45) {
                o.slowScored = true;
                this.goodSlowdowns++;
                this.points += 15;
                this.playSound('bonus');
                this.onAlert('🛡️ +15 — redução correta perto de ' + (o.kind === 'pedestrian' ? 'pedestre' : 'ciclista'));
            }

            // colisão
            if (this.invuln <= 0 && o.lane === this.lane) {
                const oTop = o.y - o.h / 2, oBottom = o.y + o.h / 2;
                if (oBottom > carTop && oTop < carBottom) {
                    this.crash(o);
                }
            }

            // ultrapassou com segurança
            if (!o.scored && o.y > this.carY + 70) {
                o.scored = true;
                this.safePasses++;
                this.points += 2;
            }
        }
        this.obstacles = this.obstacles.filter(o => o.y < this.H + 160);

        this.onHud({
            time: Math.max(0, Math.ceil(this.timeLeft)),
            speed: Math.round(this.speed),
            lives: this.lives,
            points: this.points
        });
    }

    crash(o) {
        this.lives--;
        this.crashes++;
        this.invuln = 1.6;
        this.shake = 0.45;
        this.speed = Math.max(this.minSpeed, this.speed * 0.45);
        this.points = Math.max(0, this.points - 10);
        o.scored = true;
        this.playSound('crash');
        this.onAlert(`💥 Colisão com ${o.label.toLowerCase()}!`);

        if (this.lives <= 0) this.finish('vidas');
    }

    finish(motivo) {
        if (!this.running) return;
        this.running = false;
        this.onEnd({
            motivo,
            points: this.points,
            crashes: this.crashes,
            safePasses: this.safePasses,
            goodSlowdowns: this.goodSlowdowns,
            livesLeft: Math.max(0, this.lives),
            timeSurvived: Math.round(this.duration - Math.max(0, this.timeLeft))
        });
    }

    /* ---------- Render ---------- */

    draw() {
        const c = this.ctx, W = this.W, H = this.H;
        c.save();

        if (this.shake > 0) {
            c.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
        }

        // fundo / grama
        const grama = c.createLinearGradient(0, 0, 0, H);
        grama.addColorStop(0, '#5c8f63');
        grama.addColorStop(1, '#42704a');
        c.fillStyle = grama;
        c.fillRect(-20, -20, W + 40, H + 40);

        // asfalto
        const asf = c.createLinearGradient(0, 0, 0, H);
        asf.addColorStop(0, '#4a5261');
        asf.addColorStop(1, '#333a46');
        c.fillStyle = asf;
        c.fillRect(this.roadLeft, -20, this.roadW, H + 40);

        // acostamento
        c.fillStyle = '#e8eaed';
        c.fillRect(this.roadLeft - 8, -20, 8, H + 40);
        c.fillRect(this.roadRight, -20, 8, H + 40);

        // faixas tracejadas
        c.strokeStyle = 'rgba(255,255,255,0.85)';
        c.lineWidth = 5;
        c.setLineDash([44, 46]);
        c.lineDashOffset = -this.roadOffset;
        for (let i = 1; i < this.lanes; i++) {
            const x = this.roadLeft + this.laneW * i;
            c.beginPath(); c.moveTo(x, -20); c.lineTo(x, H + 20); c.stroke();
        }
        c.setLineDash([]);

        // obstáculos
        for (const o of this.obstacles) this.drawObstacle(o);

        // carro do jogador
        this.drawPlayer();

        c.restore();
    }

    drawObstacle(o) {
        const c = this.ctx;
        const x = this.laneX(o.lane);

        c.save();
        c.translate(x, o.y);

        if (o.kind === 'hole') {
            c.fillStyle = '#12161d';
            c.beginPath(); c.ellipse(0, 0, o.w / 2, o.h / 2, 0, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#20262f'; c.lineWidth = 4; c.stroke();
        } else if (o.kind === 'cone') {
            c.fillStyle = '#f97316';
            c.beginPath(); c.moveTo(0, -o.h / 2); c.lineTo(o.w / 2, o.h / 2); c.lineTo(-o.w / 2, o.h / 2); c.closePath(); c.fill();
            c.fillStyle = '#fff';
            c.fillRect(-o.w / 4, -4, o.w / 2, 9);
        } else if (o.kind === 'pedestrian' || o.kind === 'cyclist') {
            // halo de atenção
            c.fillStyle = 'rgba(250, 204, 21, 0.22)';
            c.beginPath(); c.ellipse(0, 0, o.w, o.h * 0.85, 0, 0, Math.PI * 2); c.fill();
            c.font = `${o.h}px serif`;
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(o.icon, 0, 2);
        } else {
            // veículos
            const cor = o.kind === 'truck' ? '#cbd5e1' : ['#ef4444', '#3b82f6', '#eab308', '#a855f7'][o.lane % 4];
            c.fillStyle = 'rgba(0,0,0,0.25)';
            this.roundRect(c, -o.w / 2 + 3, -o.h / 2 + 5, o.w, o.h, 12); c.fill();
            c.fillStyle = cor;
            this.roundRect(c, -o.w / 2, -o.h / 2, o.w, o.h, 12); c.fill();
            // vidros
            c.fillStyle = 'rgba(15,23,42,0.55)';
            this.roundRect(c, -o.w / 2 + 8, -o.h / 2 + 12, o.w - 16, o.h * 0.26, 6); c.fill();
            this.roundRect(c, -o.w / 2 + 8, o.h / 2 - 12 - o.h * 0.22, o.w - 16, o.h * 0.22, 6); c.fill();
            // lanternas traseiras
            c.fillStyle = '#fecaca';
            c.fillRect(-o.w / 2 + 6, o.h / 2 - 8, 12, 5);
            c.fillRect(o.w / 2 - 18, o.h / 2 - 8, 12, 5);
        }

        c.restore();
    }

    drawPlayer() {
        const c = this.ctx;
        const w = 60, h = 104;

        c.save();
        c.translate(this.carX, this.carY);

        if (this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0) c.globalAlpha = 0.45;

        // sombra
        c.fillStyle = 'rgba(0,0,0,0.3)';
        this.roundRect(c, -w / 2 + 3, -h / 2 + 6, w, h, 14); c.fill();

        // carroceria
        const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
        g.addColorStop(0, '#0ea5e9'); g.addColorStop(1, '#0369a1');
        c.fillStyle = g;
        this.roundRect(c, -w / 2, -h / 2, w, h, 14); c.fill();

        // para-brisa e vidro traseiro
        c.fillStyle = 'rgba(226,242,255,0.85)';
        this.roundRect(c, -w / 2 + 8, -h / 2 + 14, w - 16, h * 0.24, 7); c.fill();
        c.fillStyle = 'rgba(226,242,255,0.6)';
        this.roundRect(c, -w / 2 + 8, h / 2 - 14 - h * 0.2, w - 16, h * 0.2, 7); c.fill();

        // faróis
        c.fillStyle = '#fff8dc';
        c.fillRect(-w / 2 + 6, -h / 2 + 3, 13, 6);
        c.fillRect(w / 2 - 19, -h / 2 + 3, 13, 6);

        // luz de freio acesa
        if (this.brake) {
            c.fillStyle = '#ef4444';
            c.shadowColor = '#ef4444'; c.shadowBlur = 14;
            c.fillRect(-w / 2 + 6, h / 2 - 9, 14, 6);
            c.fillRect(w / 2 - 20, h / 2 - 9, 14, 6);
            c.shadowBlur = 0;
        }

        c.restore();
    }

    roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    }
}
