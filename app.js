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
    for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
      if (code.isDark(row, col)) ctx.fillRect((col+4)*scale, (row+4)*scale, scale, scale);
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
