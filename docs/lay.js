/**
 * Project: NINE STYLE (EXPRESS V4)
 * Author: Damso Universe
 * Last Modified: 2026-04-14
 */

const siteConfig = {
    // 1. Meta Information
    meta: {
        lang: 'ko',
        theme: 'dark',
        theme_color: '#000000',
    },

    // 2. Canvas Configuration
    canvas: {
        target: '.damso-canvas',
        effect: 'faintNineGlitch',
        overlay: 'dotted',
        image_path: './section/bg/',
        image_count: 0,
        image_format: 'png'
    },

    // 3. API & Redirects
    api: {
        server: 'provider',
        redirect: '../'
    },

    // 4. Action Buttons
    buttons: [
        { name: 'Contact', icon: 'mail', url: '#contact' },
        { name: 'Search', icon: 'search', url: '#search' }
    ]
};

/**
 * faintNineGlitch Effect Module
 * Re-engineered for V4 Plugin Interface
 */
const faintNineGlitchEffect = {
    init(wrapper) {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'damso-canvas__effect';
        wrapper.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.colorRGB = '255, 255, 255'; // Changed to pure white for Nine Style
        this.fontSize = 1100;

        this.isGlitching = false;
        this.glitchDuration = 0;
        this.calmDuration = 100;
        this.flickerAlpha = 0.5;

        this.handleResize();
        this.animate();

        window.addEventListener('resize', () => this.handleResize());
    },

    handleResize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        this.ctx.scale(dpr, dpr);
        this.logicalWidth = rect.width;
        this.logicalHeight = rect.height;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    },

    drawNine(x, y, rgbString, alpha, offset = 0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        // DPR 보정: 모바일의 높은 DPR로 인해 blur가 희석되는 현상 방지
        const dpr = window.devicePixelRatio || 1;
        this.ctx.filter = `blur(${40 * dpr}px)`;

        const gradient = this.ctx.createLinearGradient(
            x, y - this.fontSize / 2,
            x, y + this.fontSize / 2
        );
        gradient.addColorStop(0, `rgba(${rgbString}, 1)`);
        gradient.addColorStop(0.5, `rgba(${rgbString}, 0.6)`);
        gradient.addColorStop(1, `rgba(${rgbString}, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.font = `300 ${this.fontSize}px "Lato", sans-serif`;

        if (Math.random() > 0.9 && this.isGlitching) {
            const sliceCount = 12;
            const sliceH = this.fontSize / sliceCount;
            for (let i = 0; i < sliceCount; i++) {
                const sliceY = (y - this.fontSize / 2) + (i * sliceH);
                const jitterX = (Math.random() - 0.5) * 60;
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(0, sliceY, this.logicalWidth, sliceH);
                this.ctx.clip();
                this.ctx.fillText('9', x + offset + jitterX, y);
                this.ctx.restore();
            }
        } else {
            this.ctx.fillText('9', x + offset, y);
        }

        this.ctx.restore();
    },

    drawNoise() {
        if (!this.isGlitching || Math.random() < 0.6) return;
        const w = this.logicalWidth;
        const h = this.logicalHeight;

        for (let i = 0; i < 3; i++) {
            const lineY = Math.random() * h;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            this.ctx.fillRect(0, lineY, w, 1);
        }
    },

    animate() {
        if (!this.canvas) return;
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

        const x = this.logicalWidth / 2;
        const y = this.logicalHeight * 0.58;

        if (this.isGlitching) {
            this.flickerAlpha = Math.random() > 0.8 ? Math.random() * 0.3 : 0.6;
            this.drawNine(x, y, this.colorRGB, this.flickerAlpha);

            const move = (Math.random() - 0.5) * 40;
            if (Math.random() > 0.4) {
                this.drawNine(x + move, y, '255, 50, 50', 0.2, move);
                this.drawNine(x - move, y, '50, 50, 255', 0.2, -move);
            }

            this.drawNoise();
            this.glitchDuration--;
            if (this.glitchDuration <= 0) {
                this.isGlitching = false;
                this.calmDuration = Math.random() * 300 + 100;
            }
        } else {
            this.drawNine(x, y, this.colorRGB, 0.5);
            this.calmDuration--;
            if (this.calmDuration <= 0) {
                this.isGlitching = true;
                this.glitchDuration = Math.random() * 50 + 80;
            }
        }

        requestAnimationFrame(this.animate.bind(this));
    }
};

/**
 * Initialize V4 Application
 */
window.addEventListener('DOMContentLoaded', async () => {
    if (!window.V4) return console.error('V4 Engine Not Found');

    // 1. Register Custom Effect BEFORE Initialization
    window.V4.Effects = window.V4.Effects || {};
    window.V4.Effects.faintNineGlitch = faintNineGlitchEffect;

    // 2. Initialize Core & View
    window.V4.init(siteConfig).then(app => {
        console.log('NINE STYLE V4 Ready');
    });
});