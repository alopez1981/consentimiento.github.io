const $canvas = document.querySelector("#canvas"),
    $btnDescargar = document.querySelector("#btnDescargar"),
    $btnLimpiar = document.querySelector("#btnLimpiar"),
    $btnGenerarDocumento = document.querySelector("#btnGenerarDocumento"),
    $nombre = document.querySelector("#nombreUsuario");

const ctx = $canvas.getContext("2d");
const COLOR_PINCEL = "black";
const COLOR_FONDO = "white";
const GROSOR = 2;

let xAnt = 0, yAnt = 0, xAct = 0, yAct = 0;
let dibujando = false;
let huboTrazo = false;

/* ---------- Canvas responsive (ancho contenedor + DPR) ---------- */
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = $canvas.getBoundingClientRect();
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height || 240); // por si aún no tiene alto calculado

    // bitmap interno en px reales
    $canvas.width = Math.round(cssW * dpr);
    $canvas.height = Math.round(cssH * dpr);

    // dibujaremos en px del bitmap (sin scale)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = COLOR_PINCEL;
    ctx.lineWidth = GROSOR * dpr;

    limpiarCanvas();
}

function limpiarCanvas() {
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}

/* ---------- Coordenadas: de px CSS -> px bitmap ---------- */
function coords(ev) {
    const r = $canvas.getBoundingClientRect();
    const t = ev.touches?.[0] ?? ev;
    const scaleX = $canvas.width / r.width;
    const scaleY = $canvas.height / r.height;
    return {
        x: (t.clientX - r.left) * scaleX,
        y: (t.clientY - r.top) * scaleY
    };
}

/* ---------- Dibujo ---------- */
function inicioDibujo(ev) {
    ev.preventDefault();
    const p = coords(ev);
    xAct = p.x;
    yAct = p.y;
    ctx.beginPath();
    ctx.fillStyle = COLOR_PINCEL;
    ctx.fillRect(xAct, yAct, ctx.lineWidth, ctx.lineWidth);
    ctx.closePath();
    dibujando = true;
    huboTrazo = true;
}

function movDibujo(ev) {
    ev.preventDefault();
    if (!dibujando) return;
    const p = coords(ev);
    xAnt = xAct;
    yAnt = yAct;
    xAct = p.x;
    yAct = p.y;
    ctx.beginPath();
    ctx.moveTo(xAnt, yAnt);
    ctx.lineTo(xAct, yAct);
    ctx.stroke();
    ctx.closePath();
}

function finDibujo() {
    dibujando = false;
}

/* ---------- Botones ---------- */
$btnLimpiar.onclick = () => {
    limpiarCanvas();
    huboTrazo = false;
};

$btnDescargar.onclick = () => {
    const a = document.createElement('a');
    a.download = "Firma.png";
    a.href = $canvas.toDataURL("image/png");
    a.click();
};

$btnGenerarDocumento.onclick = () => {
    const nombre = ($nombre?.value || "").trim();
    if (!nombre) {
        alert("Introduce el nombre del alumno.");
        return;
    }
    if (!huboTrazo) {
        alert("Falta la firma.");
        return;
    }

    const fecha = new Date().toLocaleDateString();
    const firmaDataUrl = $canvas.toDataURL("image/png");

    try {
        localStorage.setItem("firmaDataUrl", firmaDataUrl);
    } catch {
    }

    const url = `documento.html?nombre=${encodeURIComponent(nombre)}&fecha=${encodeURIComponent(fecha)}`;
    window.open(url);
};

/* ---------- Eventos ---------- */
["mousedown", "touchstart"].forEach(e =>
    $canvas.addEventListener(e, inicioDibujo, {passive: false})
);
["mousemove", "touchmove"].forEach(e =>
    $canvas.addEventListener(e, movDibujo, {passive: false})
);
["mouseup", "touchend", "mouseleave", "touchcancel"].forEach(e =>
    $canvas.addEventListener(e, finDibujo, {passive: false})
);

/* ---------- Init / redimensionado ---------- */
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
