import React, { useEffect, useRef } from "react";

export default function HeroSection() {
  const canvasRef = useRef(null);

  /* Starfield warp — stars radiate outward, stretching into lines near edges */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const STAR_COUNT = 220;
    const SPEED = 0.012;

    let cw, ch;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cw = canvas.offsetWidth;
      ch = canvas.offsetHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const resetStar = () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random() * 0.9 + 0.1,
    });
    const stars = Array.from({ length: STAR_COUNT }, resetStar);

    const colors = [
      [180, 237, 87],   // green
      [255, 255, 255],  // white
      [255, 255, 255],  // white (weighted)
      [200, 215, 255],  // pale blue
      [140, 130, 230],  // soft purple
    ];

    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      const halfW = cw / 2;
      const halfH = ch / 2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Previous z for trail origin
        const prevZ = s.z;
        s.z -= SPEED;
        if (s.z <= 0.005) {
          Object.assign(s, resetStar());
          continue;
        }

        const depth = 1 - s.z; // 0 = far, 1 = near

        // Current projected position
        const px = halfW + (s.x / s.z) * halfW * 0.6;
        const py = halfH + (s.y / s.z) * halfH * 0.6;

        // Trail origin — from where the star was last frame
        const tx = halfW + (s.x / prevZ) * halfW * 0.6;
        const ty = halfH + (s.y / prevZ) * halfH * 0.6;

        // Skip off-screen
        if (px < -20 || px > cw + 20 || py < -20 || py > ch + 20) continue;

        // Colour
        const c = colors[i % colors.length];
        const brightness = 0.5 + depth * 0.5;
        const lineW = 1 + depth * 3;

        // --- Streak line (gets longer as star approaches edges) ---
        const grad = ctx.createLinearGradient(tx, ty, px, py);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]}, 0)`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]}, ${brightness})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.stroke();

        // --- Bright head dot ---
        ctx.beginPath();
        ctx.arc(px, py, lineW * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]}, ${brightness})`;
        ctx.fill();

        // --- Glow halo on nearby stars ---
        if (depth > 0.55) {
          ctx.beginPath();
          ctx.arc(px, py, lineW * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]}, ${(depth - 0.55) * 0.35})`;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl mx-4 mt-[64px] mb-12">
      {/* Continuously moving gradient background */}
      <div
        className="absolute inset-0 hero-gradient-move rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #1a1d5e 0%, #2a2f8a 12%, #4D58D4 25%, #6B63D9 38%, #7B6FE0 50%, #5a5fd6 62%, #4D58D4 75%, #2a2f8a 88%, #1a1d5e 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Moving dot-grid pixels */}
      <div
        className="absolute inset-0 opacity-[0.06] hero-dots-move"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(180,237,87,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Starfield warp canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Vertical background lines */}
      <div className="absolute inset-0 opacity-[0.08]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-white h-full"
            style={{ left: `${(i + 1) * 5}%` }}
          />
        ))}
      </div>

      {/* Glow orbs for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6B63D9]/30 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7FFF]/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4D58D4]/20 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative text-center px-8 max-w-4xl flex flex-col items-center justify-center">
        <h1 className="text-white text-5xl md:text-[4.5rem] font-light tracking-tight" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
          The Future of
        </h1>
        <span
          className="text-[#B4ED57] text-7xl md:text-[10rem] leading-none block -my-2"
          style={{ fontFamily: "'Pixelify Sans', cursive", fontStyle: 'italic' }}
        >
          Hackathon
        </span>
        <h1 className="text-white text-5xl md:text-[4.5rem] font-light tracking-tight mb-6" style={{ fontFamily: "'Questrial', sans-serif", lineHeight: 1 }}>
          Management
        </h1>
        <p className="text-white/60 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'Fustat', sans-serif" }}>
          Experience seamless hackathon participation with AI-powered
          verification, smart team matching, and real-time event tracking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3.5 bg-[#B4ED57] hover:bg-[#c5f278] text-black font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 text-base" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Get Started Free &nbsp;→
          </button>
          <button className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-full transition-all border border-white/20 backdrop-blur-sm text-base" style={{ fontFamily: "'Fustat', sans-serif" }}>
            Explore Hackathons
          </button>
        </div>
      </div>
    </section>
  );
}