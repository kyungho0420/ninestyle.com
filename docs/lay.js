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
        image_format: 'png',
        offsetX: '10rem',
        offsetY: '10rem'
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
        
        // Cache Configuration
        this.cacheCanvas = document.createElement('canvas');
        this.cacheCtx = this.cacheCanvas.getContext('2d');
        
        this.cacheCanvasRed = document.createElement('canvas');
        this.cacheCtxRed = this.cacheCanvasRed.getContext('2d');

        this.cacheCanvasBlue = document.createElement('canvas');
        this.cacheCtxBlue = this.cacheCanvasBlue.getContext('2d');

        
        this.colorRGB = '255, 255, 255';
        this.fontSize = 1100;

        this.isGlitching = false;
        this.glitchDuration = 0;
        this.calmDuration = 100;
        this.flickerAlpha = 0.5;

        this.handleResize();
        this.animate();

        // Refresh cache after fonts are loaded to ensure correct typeface
        if (document.fonts) {
            document.fonts.ready.then(() => {
                this.preRender();
            });
        }

        window.addEventListener('resize', () => this.handleResize());
    },

    preRender() {
        const dpr = window.devicePixelRatio || 1;
        // Padding for blur
        const pad = 100 * dpr;
        const size = (this.fontSize + pad * 2);

        this.cacheCanvas.width = size * dpr;
        this.cacheCanvas.height = size * dpr;
        
        const cctx = this.cacheCtx;
        cctx.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        cctx.save();
        cctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;

        cctx.filter = `blur(${40 * dpr}px)`;
        
        const gradient = cctx.createLinearGradient(
            cx, cy - this.fontSize / 2,
            cx, cy + this.fontSize / 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.6)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        cctx.fillStyle = gradient;
        cctx.font = `300 ${this.fontSize}px "Lato", sans-serif`;
        cctx.textAlign = 'center';
        cctx.textBaseline = 'middle';
        cctx.fillText('9', cx, cy);
        
        cctx.restore();
        
        this.cacheOffset = size / 2;

        // Create Red/Blue Tints from Main Cache
        this.renderTint(this.cacheCanvasRed, this.cacheCtxRed, 'rgb(255, 50, 50)');
        this.renderTint(this.cacheCanvasBlue, this.cacheCtxBlue, 'rgb(50, 50, 255)');
    },

    renderTint(canvas, ctx, color) {
        canvas.width = this.cacheCanvas.width;
        canvas.height = this.cacheCanvas.height;
        ctx.drawImage(this.cacheCanvas, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
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

        // Get 1em in pixels
        this.emToPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;


        this.fontSize = Math.min(1100, 600 + (rect.width * 0.25));

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.preRender();
    },


    drawNine(x, y, rgbString, alpha, offset = 0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Select Cache based on color
        let targetCache = this.cacheCanvas;
        if (rgbString === '255, 50, 50') targetCache = this.cacheCanvasRed;
        else if (rgbString === '50, 50, 255') targetCache = this.cacheCanvasBlue;

        const drawX = x + offset - this.cacheOffset;
        const drawY = y - this.cacheOffset;
        const drawSize = this.cacheCanvas.width / (window.devicePixelRatio || 1);

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
                this.ctx.drawImage(targetCache, drawX + jitterX, drawY, drawSize, drawSize);
                this.ctx.restore();
            }
        } else {
            this.ctx.drawImage(targetCache, drawX, drawY, drawSize, drawSize);
        }

        this.ctx.restore();
    },



    drawNoise() {
        if (!this.isGlitching || Math.random() < 0.3) return;
        const w = this.logicalWidth;
        const h = this.logicalHeight;

        for (let i = 0; i < 6; i++) {
            const lineY = Math.random() * h;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
            this.ctx.fillRect(0, lineY, w, Math.random() * 1.5);
        }

        for (let i = 0; i < 10; i++) {
            const bx = Math.random() * w;
            const by = Math.random() * h;
            const bw = Math.random() * 40;
            const bh = Math.random() * 15;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.12})`;
            this.ctx.fillRect(bx, by, bw, bh);
        }

        for (let i = 0; i < 20; i++) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
            this.ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
        }
    },

    animate() {
        if (!this.canvas) return;
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

        // Calculate Position (Center + Offset)
        const config = siteConfig.canvas;
        const offX = (parseFloat(config.offsetX) || 0) * this.emToPx;
        const offY = (parseFloat(config.offsetY) || 0) * this.emToPx;

        const x = (this.logicalWidth / 2) + offX;
        const y = (this.logicalHeight / 2) + offY;


        if (this.isGlitching) {
            // 미세 진동 (Jitter)
            const jX = (Math.random() - 0.5) * 4;
            const jY = (Math.random() - 0.5) * 4;

            this.flickerAlpha = Math.random() > 0.8 ? Math.random() * 0.1 + 0.2 : 0.3;
            this.drawNine(x + jX, y + jY, this.colorRGB, this.flickerAlpha);

            const move = (Math.random() - 0.5) * 40;
            if (Math.random() > 0.4) {
                this.drawNine(x + jX + move, y + jY, '255, 50, 50', 0.2, move);
                this.drawNine(x + jX - move, y + jY, '50, 50, 255', 0.2, -move);
            }

            this.drawNoise();
            this.glitchDuration--;
            if (this.glitchDuration <= 0) {
                this.isGlitching = false;
                this.calmDuration = Math.random() * 300 + 100;
            }
        } else {
            this.drawNine(x, y, this.colorRGB, 0.30);

            this.calmDuration--;
            if (this.calmDuration <= 0) {
                this.isGlitching = true;
                this.glitchDuration = Math.random() * 50 + 20;
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