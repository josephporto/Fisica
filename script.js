document.addEventListener("DOMContentLoaded", () => {
  const form         = document.querySelector("form");
  const resultadoDiv = document.querySelector(".resultados");
  const errorDiv     = document.querySelector(".error");
  const canvas       = document.getElementById("canvas");
  const ctx          = canvas.getContext("2d");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const anguloA = form.anguloA.valueAsNumber;
    const anguloB = form.anguloB.valueAsNumber;
    const masa    = form.masa.valueAsNumber;
    const g       = 10;
    const peso    = masa * g;

    try {
      const a = anguloA * Math.PI / 180;
      const b = anguloB * Math.PI / 180;

      function derivada(fn, x, h = 1e-5) {
        return (fn(x + h) - fn(x - h)) / (2 * h);
      }

      function f_T2(t2) {
        const t1 = (-Math.cos(b) * t2) / Math.cos(a);
        return (t1 * Math.sin(a) + t2 * Math.sin(b)) - peso;
      }

      function encontrarT2(fn, guess = 10, tol = 1e-4, maxIter = 100) {
        let t2 = guess;
        for (let i = 0; i < maxIter; i++) {
          const delta = fn(t2) / derivada(fn, t2);
          t2 -= delta;
          if (Math.abs(delta) < tol) break;
        }
        return t2;
      }

      const t2 = encontrarT2(f_T2);
      const t1 = (-Math.cos(b) * t2) / Math.cos(a);
      const t3 = peso;

      resultadoDiv.innerHTML = `
        <h3>Resultados</h3>
        <p><strong>Tensión 1:</strong> ${t1.toFixed(2)} N</p>
        <p><strong>Tensión 2:</strong> ${t2.toFixed(2)} N</p>
        <p><strong>Tensión 3 (peso):</strong> ${t3.toFixed(2)} N</p>
      `;
      resultadoDiv.style.display = "block";
      errorDiv.textContent       = "";

      dibujarGrafico(a, b);
    } catch (err) {
      errorDiv.textContent       = "Error en los cálculos: " + err.message;
      resultadoDiv.style.display = "none";
    }
  });

  function dibujarGrafico(a, b) {
    const w   = canvas.width;
    const h   = canvas.height;
    const cx  = w / 2;
    const cy  = h / 2;
    const esc = 100;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let x = cx % 50; x < w; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % 50; y < h; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    const arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(w, cy);
    ctx.lineTo(w - arrowSize, cy - arrowSize / 2);
    ctx.lineTo(w - arrowSize, cy + arrowSize / 2);
    ctx.fillStyle = "#888"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx - arrowSize / 2, arrowSize);
    ctx.lineTo(cx + arrowSize / 2, arrowSize);
    ctx.fill();

    const vects = [
      { x:  Math.cos(a)*esc, y: -Math.sin(a)*esc, col:"blue",  ang:a },
      { x:  Math.cos(b)*esc, y: -Math.sin(b)*esc, col:"green", ang:b },
      { x:  0,               y:  esc,            col:"red",   ang:3*Math.PI/2 }
    ];

    ctx.lineWidth = 3;
    ctx.font      = "bold 14px sans-serif";

    for (let v of vects) {
      ctx.strokeStyle = v.col;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + v.x, cy + v.y);
      ctx.stroke();

      const phi = Math.atan2(v.y, v.x);
      const hx = cx + v.x, hy = cy + v.y;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - 10 * Math.cos(phi - Math.PI/6), hy - 10 * Math.sin(phi - Math.PI/6));
      ctx.lineTo(hx - 10 * Math.cos(phi + Math.PI/6), hy - 10 * Math.sin(phi + Math.PI/6));
      ctx.fillStyle = v.col;
      ctx.fill();

      ctx.fillText(
        (v.ang * 180/Math.PI).toFixed(1) + "°",
        cx + v.x * 0.6,
        cy + v.y * 0.6
      );
    }

    // Título
    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.fillText("Direcciones de Tensiones (con ángulos)", 20, 20);
  }
});
