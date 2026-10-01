const form = document.querySelector('#form');
const reference = document.querySelector('#reference');
const error = document.querySelector('#error');
const status = document.querySelector('#status');
const canvas = document.querySelector('#qr');
let current;
for (const book of BOOKS) {
  const option = document.createElement('option');
  option.value = book.name + ' 1';
  document.querySelector('#suggestions').append(option);
}
function generate() {
  error.hidden = true;
  reference.removeAttribute('aria-invalid');
  status.textContent = '';
  try {
    const result = parseInput(reference.value);
    const code = qrcode(0, 'M');
    code.addData(result.url);
    code.make();
    const count = code.getModuleCount();
    const scale = Math.floor(768 / (count + 8));
    canvas.width = canvas.height = (count + 8) * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    const finders = [[0, 0], [0, count - 7], [count - 7, 0]];
    for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
      if (!code.isDark(row, col)) continue;
      if (finders.some(([r, c]) => row >= r && row < r + 7 && col >= c && col < c + 7)) continue;
      // Round only exposed corners so adjacent dark blocks remain connected.
      const dark = (r, c) => r >= 0 && c >= 0 && r < count && c < count && code.isDark(r, c);
      const top = dark(row - 1, col), bottom = dark(row + 1, col);
      const left = dark(row, col - 1), right = dark(row, col + 1);
      const radius = scale * 0.4;
      const tl = !top && !left ? radius : 0, tr = !top && !right ? radius : 0;
      const br = !bottom && !right ? radius : 0, bl = !bottom && !left ? radius : 0;
      const x = (col + 4) * scale, y = (row + 4) * scale, endX = x + scale, endY = y + scale;
      ctx.beginPath();
      ctx.moveTo(x + tl, y);
      ctx.lineTo(endX - tr, y); ctx.quadraticCurveTo(endX, y, endX, y + tr);
      ctx.lineTo(endX, endY - br); ctx.quadraticCurveTo(endX, endY, endX - br, endY);
      ctx.lineTo(x + bl, endY); ctx.quadraticCurveTo(x, endY, x, endY - bl);
      ctx.lineTo(x, y + tl); ctx.quadraticCurveTo(x, y, x + tl, y);
      ctx.closePath(); ctx.fill();
    }
    // Draw each finder as continuous nested shapes, preserving its 7:5:3 proportions.
    function roundedSquare(x, y, size, radius, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath(); ctx.fill();
    }
    for (const [row, col] of finders) {
      const x = (col + 4) * scale, y = (row + 4) * scale;
      roundedSquare(x, y, 7 * scale, 1.4 * scale, '#000000');
      roundedSquare(x + scale, y + scale, 5 * scale, 0.8 * scale, '#ffffff');
      roundedSquare(x + 2 * scale, y + 2 * scale, 3 * scale, 0.6 * scale, '#000000');
    }
    current = result;
    document.querySelector('#result-title').textContent = result.label;
    document.querySelector('#link').value = result.url;
    document.querySelector('#open').href = result.url;
    canvas.setAttribute('aria-label', `QR code for ${result.label}`);
    status.textContent = `Link and QR code ready for ${result.label}.`;
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
    reference.setAttribute('aria-invalid', 'true');
    reference.focus();
  }
}
form.addEventListener('submit', event => { event.preventDefault(); generate(); });
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => { reference.value = button.dataset.example; generate(); }));
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(current.url); status.textContent = 'Link copied.'; }
  catch { document.querySelector('#link').select(); status.textContent = 'Select Copy from your browser menu, or press Ctrl+C / ⌘C to copy the selected link.'; }
});
document.querySelector('#download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = current.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-qr.png';
  a.href = canvas.toDataURL('image/png'); a.click();
  status.textContent = `QR image download requested for ${current.label}.`;
});
generate();
