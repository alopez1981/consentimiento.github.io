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
let huboTrazo = false; // <- para validar que hay firma

const xReal = (cx) => cx - $canvas.getBoundingClientRect().left;
const yReal = (cy) => cy - $canvas.getBoundingClientRect().top;

function limpiarCanvas() {
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}

limpiarCanvas();

$btnLimpiar.onclick = () => {
    limpiarCanvas();
    huboTrazo = false;
};

$btnDescargar.onclick = () => {
    const a = document.createElement('a');
    a.download = "Firma.png";
    a.href = $canvas.toDataURL();
    a.click();
};

window.obtenerImagen = () => $canvas.toDataURL();

function inicioDibujo(ev) {
    const t = ev.type.includes("touch") ? ev.touches[0] : ev;
    xAct = xReal(t.clientX);
    yAct = yReal(t.clientY);
    ctx.beginPath();
    ctx.fillStyle = COLOR_PINCEL;
    ctx.fillRect(xAct, yAct, GROSOR, GROSOR);
    ctx.closePath();
    dibujando = true;
    huboTrazo = true;
}

function movDibujo(ev) {
    ev.preventDefault();
    if (!dibujando) return;
    const t = ev.type.includes("touch") ? ev.touches[0] : ev;
    xAnt = xAct;
    yAnt = yAct;
    xAct = xReal(t.clientX);
    yAct = yReal(t.clientY);
    ctx.beginPath();
    ctx.moveTo(xAnt, yAnt);
    ctx.lineTo(xAct, yAct);
    ctx.strokeStyle = COLOR_PINCEL;
    ctx.lineWidth = GROSOR;
    ctx.stroke();
    ctx.closePath();
}

function finDibujo() {
    dibujando = false;
}

["mousedown", "touchstart"].forEach(e => $canvas.addEventListener(e, inicioDibujo));
["mousemove", "touchmove"].forEach(e => $canvas.addEventListener(e, movDibujo));
["mouseup", "touchend", "mouseleave"].forEach(e => $canvas.addEventListener(e, finDibujo));

// --- Un solo botón que hace todo ---
$btnGenerarDocumento.onclick = () => {
    const nombre = ($nombre.value || "").trim();
    if (!nombre) {
        alert("Introduce el nombre del alumno.");
        return;
    }
    if (!huboTrazo) {
        alert("Falta la firma.");
        return;
    }

    const fecha = new Date().toLocaleDateString();
    const firmaDataUrl = $canvas.toDataURL();

    localStorage.setItem("nombreUsuario", nombre);
    localStorage.setItem("fecha", fecha);
    localStorage.setItem("firmaDataUrl", firmaDataUrl); // respaldo

    window.open("documento.html");
};
