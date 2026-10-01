/* ES5-compatible retro controller. Image QR rendering does not require canvas. */
(function () {
  function el(id) { return document.getElementById(id); }
  function text(node, value) {
    if ('textContent' in node) node.textContent = value;
    else node.innerText = value;
  }
  function normalize(value) {
    return value.toLowerCase().replace(/\b(first|second|third|fourth)\b/g, function (word) {
      return {first:'1', second:'2', third:'3', fourth:'4'}[word];
    }).replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
  }
  function parse(value) {
    value = value.replace(/^\s+|\s+$/g, '');
    if (/^(?:[a-z][a-z0-9+.-]*:|www\.|[a-z0-9.-]+\.(?:org|com)\/)/i.test(value)) {
      if (/\s/.test(value)) throw new Error('Paste a complete share link without extra text or spaces.');
      if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = 'https://' + value;
      // Validate the literal authority before using an anchor as an older-browser URL parser.
      if (!/^https?:\/\/(?:[a-z0-9-]+\.)*(?:lds\.org|churchofjesuschrist\.org)(?:[/?#]|$)/i.test(value)) {
        throw new Error('Use an http or https share link from lds.org or churchofjesuschrist.org.');
      }
      var anchor = document.createElement('a'); anchor.href = value;
      if (anchor.href.length > 2000) throw new Error('This link is too long. Copy a shorter Gospel Library share link.');
      return {label: value.indexOf('general-conference') >= 0 ? 'Conference talk' : 'Gospel Library link', url: anchor.href};
    }
    var match = value.replace(/[–—]/g, '-').match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*))?$/);
    if (!match) throw new Error('Enter a reference such as 1 Nephi 11:17, or paste a Gospel Library share link.');
    var key = normalize(match[1]), book, i, j;
    var aliases = {dandc:'dc',doctrineandcovenants:'dc',psalm:'ps',songofsolomon:'song',songofsongs:'song',jsh:'js-h',jsm:'js-m',aof:'a-of-f',wom:'w-of-m'};
    for (i = 0; i < BOOKS.length; i++) {
      if (normalize(BOOKS[i].name) === key || normalize(BOOKS[i].slug) === key || BOOKS[i].slug === aliases[key]) { book = BOOKS[i]; break; }
    }
    if (!book) throw new Error('Book not recognized. Try a full book name, such as 1 Nephi or Moses.');
    var chapter = Number(match[2]);
    if (chapter < 1 || chapter > book.counts.length) throw new Error('Enter a chapter or section from 1 to ' + book.counts.length + '.');
    var parts = match[3] ? match[3].replace(/\s/g, '').split(',') : [], ids = [], verses = [], first;
    for (i = 0; i < parts.length; i++) {
      var range = parts[i].split('-'), start = Number(range[0]), end = Number(range[range.length - 1]);
      if (start < 1 || end < start || end > book.counts[chapter - 1]) throw new Error('Use verses 1-' + book.counts[chapter - 1] + ' with ranges in ascending order.');
      if (i === 0) first = start;
      var id = [], nums = [];
      for (j = 0; j < range.length; j++) { id.push('p' + Number(range[j])); nums.push(Number(range[j])); }
      ids.push(id.join('-')); verses.push(nums.join('-'));
    }
    return {label:book.name + ' ' + chapter + (parts.length ? ':' + verses.join(',') : ''), url:'https://www.churchofjesuschrist.org/study/scriptures/' + book.volume + '/' + book.slug + '/' + chapter + '?lang=eng' + (parts.length ? '&id=' + ids.join(',') + '#p' + first : '')};
  }
  var current, imageURL;
  function generate() {
    el('error').style.display = 'none';
    el('reference').removeAttribute('aria-invalid');
    try {
      var result = parse(el('reference').value);
      var qr = qrcode(0, 'M'); qr.addData(result.url); qr.make();
      imageURL = qr.createDataURL(6, 24);
      current = result;
      el('qr').src = imageURL; el('qr').alt = 'QR code for ' + result.label;
      text(el('result-title'), result.label); el('link').value = result.url; el('open').href = result.url;
      text(el('status'), 'Link and QR code ready for ' + result.label + '.');
    } catch (error) {
      el('error').removeAttribute('hidden'); el('error').style.display = 'block';
      text(el('error'), error.message || 'Unable to create this QR code. Try a shorter link.');
      el('reference').setAttribute('aria-invalid', 'true'); el('reference').focus();
    }
  }
  el('form').onsubmit = function () { generate(); return false; };
  var buttons = document.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].getAttribute('data-example')) buttons[i].onclick = function () { el('reference').value = this.getAttribute('data-example'); generate(); };
  }
  el('copy').onclick = function () {
    el('link').focus(); el('link').select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (ignore) {}
    text(el('status'), copied ? 'Link copied.' : 'Use Ctrl+C, Command+C, or your browser Copy menu to copy the selected link.');
  };
  el('download').onclick = function () {
    if (!current) return;
    var a = document.createElement('a');
    if ('download' in a) {
      a.href = imageURL; a.download = current.label.replace(/[^a-z0-9]+/gi, '-') + '-qr.gif';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } else text(el('status'), 'Right-click or press and hold the QR image, then choose Save image as.');
  };
  generate();
})();
