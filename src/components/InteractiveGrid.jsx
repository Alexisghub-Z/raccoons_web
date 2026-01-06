import { useEffect, useRef } from 'react';
import './InteractiveGrid.css';

function InteractiveGrid() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafIdRef = useRef(null);
  const gridMapRef = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let isActive = true;
    let hasActiveCell = false;

    // Función para obtener el tamaño correcto del contenedor
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);

      return { width: rect.width, height: rect.height };
    };

    let { width, height } = updateCanvasSize();
    const squareSize = 80;
    const grid = [];
    const gridMap = gridMapRef.current;

    function initGrid() {
      grid.length = 0;
      gridMap.clear();

      const cols = Math.ceil(width / squareSize);

      for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
          const cell = {
            x,
            y,
            alpha: 0,
            fading: false,
            lastTouched: 0,
          };
          grid.push(cell);

          // Mapear para acceso rápido O(1)
          const col = Math.floor(x / squareSize);
          const row = Math.floor(y / squareSize);
          gridMap.set(`${col},${row}`, cell);
        }
      }
    }

    // Throttle para resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newSize = updateCanvasSize();
        width = newSize.width;
        height = newSize.height;
        initGrid();
      }, 150);
    };

    // Throttle mejorado para mousemove - escucha en document para evitar conflictos
    let lastMouseMove = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // ~60fps max
      lastMouseMove = now;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Solo activar si el mouse está dentro del contenedor
      if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Acceso O(1) usando mapa
        const col = Math.floor(mouseX / squareSize);
        const row = Math.floor(mouseY / squareSize);
        const cell = gridMap.get(`${col},${row}`);

        if (cell && cell.alpha === 0) {
          cell.alpha = 1;
          cell.lastTouched = now;
          cell.fading = false;
          hasActiveCell = true;
        }
      }
    };

    function drawGrid() {
      if (!isActive) return;

      ctx.clearRect(0, 0, width, height);
      const now = Date.now();
      let stillActive = false;

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];

        if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 500) {
          cell.fading = true;
        }

        if (cell.fading) {
          cell.alpha -= 0.02;
          if (cell.alpha <= 0) {
            cell.alpha = 0;
            cell.fading = false;
          }
        }

        if (cell.alpha > 0) {
          stillActive = true;
          const centerX = cell.x + squareSize / 2;
          const centerY = cell.y + squareSize / 2;

          const gradient = ctx.createRadialGradient(
            centerX, centerY, 5,
            centerX, centerY, squareSize
          );
          gradient.addColorStop(0, `rgba(59, 130, 246, ${cell.alpha * 0.8})`);
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cell.x, cell.y, squareSize, squareSize);
        }
      }

      hasActiveCell = stillActive;
      rafIdRef.current = requestAnimationFrame(drawGrid);
    }

    // Escuchar eventos en document para evitar conflictos con z-index
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    initGrid();
    drawGrid();

    return () => {
      isActive = false;
      clearTimeout(resizeTimeout);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      gridMap.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className="interactive-grid-container">
      <canvas ref={canvasRef} className="interactive-grid-canvas" />
    </div>
  );
}

export default InteractiveGrid;
