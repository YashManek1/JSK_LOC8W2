import React, { useEffect, useRef } from "react";

// Simple QR-like pattern generator for visual effect
function drawFakeQR(canvas, data) {
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 21;
  const cellSize = size / cells;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);

  // Generate a deterministic-ish pattern from data string
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  ctx.fillStyle = "#000";

  // Draw finder patterns (corners)
  const drawFinder = (x, y) => {
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#fff";
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#000";
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0);
  drawFinder(14, 0);
  drawFinder(0, 14);

  // Fill data region
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      // Skip finder pattern areas
      if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) continue;
      const bit = (hash ^ (row * 31 + col * 17 + data.charCodeAt((row + col) % data.length))) & 1;
      ctx.fillStyle = bit ? "#000" : "#fff";
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
}

export default function QRCodeDisplay({ data, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      drawFakeQR(canvasRef.current, data);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
      style={{ imageRendering: "pixelated" }}
    />
  );
}