/**
 * Turns a draw function into an animated GIF (played once, last frame held).
 * One palette is shared by every frame: it's computed from a few sample frames,
 * which keeps the colors stable (no flicker) and the encoding fast.
 */
const { GIFEncoder, quantize, applyPalette } = require("gifenc");
const { create } = require("./kit");

/**
 * @param {object} o
 * @param {number} o.width logical width
 * @param {number} o.height logical height
 * @param {number} o.frames number of frames
 * @param {number} [o.fps] frames per second (Discord plays GIFs at up to ~50 fps, 25 looks smooth)
 * @param {number} [o.scale] export scale
 * @param {(ctx: CanvasRenderingContext2D, t: number) => void} o.draw t goes from 0 to 1
 */
const animate = ({ width, height, frames, fps = 25, scale = 1, draw }) => {
    const { canvas, ctx } = create(width, height, scale);
    const pw = canvas.width;
    const ph = canvas.height;

    const shots = [];
    for(let i = 0; i < frames; i++) {
        ctx.save();
        draw(ctx, frames === 1 ? 1 : i / (frames - 1));
        ctx.restore();
        shots.push(ctx.getImageData(0, 0, pw, ph).data);
    };

    // Designing a card? RENDER_DEBUG=folder writes the middle and last frames as PNG
    if(process.env.RENDER_DEBUG) {
        const fs = require("fs");
        const path = require("path");
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        for(const [ label, i ] of [ [ "mid", Math.floor(frames / 3) ], [ "last", frames - 1 ] ]) {
            const frame = create(width, height, scale);
            frame.ctx.putImageData(new (require("@napi-rs/canvas").ImageData)(shots[i], pw, ph), 0, 0);
            fs.writeFileSync(path.join(process.env.RENDER_DEBUG, `frame-${id}-${label}.png`), frame.canvas.toBuffer("image/png"));
        };
    };

    // Palette from the first, middle and last frames
    const samples = [ shots[0], shots[Math.floor(frames / 2)], shots[frames - 1] ];
    const joined = new Uint8ClampedArray(samples.reduce((n, s) => n + s.length, 0));
    let offset = 0;
    for(const s of samples) { joined.set(s, offset); offset += s.length; };
    const palette = quantize(joined, 256);

    const gif = GIFEncoder();
    const delay = Math.round(1000 / fps);
    shots.forEach((data, i) => {
        gif.writeFrame(applyPalette(data, palette), pw, ph, {
            palette: i === 0 ? palette : undefined,
            delay: i === frames - 1 ? 60000 : delay, // hold the result
            repeat: i === 0 ? -1 : undefined // play once
        });
    });
    gif.finish();
    return Buffer.from(gif.bytes());
};

module.exports = { animate };
