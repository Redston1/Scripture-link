(function (root) {
  const books = typeof module !== 'undefined' ? require('./books.js') : BOOKS;
  function normalize(value) {
    return value.toLowerCase().replace(/\b(first|second|third|fourth)\b/g, word => ({first:'1',second:'2',third:'3',fourth:'4'}[word]))
      .replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
  }
  const aliases = {'dandc':'dc','doctrineandcovenants':'dc','psalm':'ps','songofsolomon':'song','songofsongs':'song','jsh':'js-h','jsm':'js-m','aof':'a-of-f','wom':'w-of-m'};
  function parseReference(input) {
    const match = input.trim().replace(/[–—]/g,'-').match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*))?$/);
    if (!match) throw new Error('Enter a book and chapter, with optional verses. For example: 1 Nephi 11:17 or John 3:16-17.');
    const key = normalize(match[1]);
    const book = books.find(b => normalize(b.name) === key || normalize(b.slug) === key || b.slug === aliases[key]);
    if (!book) throw new Error('Book not recognized. Choose a name from the suggestions, such as 1 Nephi, D&C, or Moses.');
    const chapter = Number(match[2]);
    if (chapter < 1 || chapter > book.counts.length) throw new Error(`${book.name} has ${book.counts.length} ${book.slug === 'dc' ? 'sections' : 'chapters'}. Enter a number from 1 to ${book.counts.length}.`);
    const parts = match[3] ? match[3].replace(/\s/g,'').split(',').map(part => part.split('-').map(Number)) : [];
    const max = book.counts[chapter-1];
    for (const [start, end = start] of parts) {
      if (start < 1 || end < start || end > max) throw new Error(`${book.name} ${chapter} has ${max} verses. Use verses 1-${max} and put ranges in ascending order.`);
    }
    const verses = parts.map(p => p.join('-')).join(',');
    const id = parts.map(p => p.map(v => `p${v}`).join('-')).join(',');
    const url = `https://www.churchofjesuschrist.org/study/scriptures/${book.volume}/${book.slug}/${chapter}?lang=eng${id ? `&id=${id}#p${parts[0][0]}` : ''}`;
    return {label:`${book.name} ${chapter}${verses ? ':'+verses : ''}`, url};
  }
  function parseInput(input) {
    const value = input.trim();
    if (!/^(?:[a-z][a-z0-9+.-]*:|(?:www\.|[a-z0-9.-]+\.(?:org|com)\/))/i.test(value)) return parseReference(value);
    let link;
    try {
      if (/\s/.test(value)) throw new Error();
      link = new URL(/^https?:\/\//i.test(value) ? value : (/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value));
    } catch {
      throw new Error('Paste a complete Gospel Library share link, without extra text or spaces.');
    }
    const allowed = ['lds.org', 'churchofjesuschrist.org'].some(domain => link.hostname === domain || link.hostname.endsWith('.' + domain));
    if (!['http:', 'https:'].includes(link.protocol) || !allowed || link.username || link.password || link.port) {
      throw new Error('Use an http or https share link from lds.org or churchofjesuschrist.org.');
    }
    if (link.href.length > 2000) throw new Error('This link is too long for a QR code. Copy a shorter share link from Gospel Library.');
    // Preserve the original host, path, query, language, and fragment. Legacy
    // redirects and opaque paragraph IDs must remain under the publisher’s control.
    return {label: link.pathname.includes('general-conference') ? 'Conference talk' : 'Gospel Library link', url: link.href};
  }
  if (typeof module !== 'undefined') module.exports = {parseReference, parseInput};
  else { root.parseReference = parseReference; root.parseInput = parseInput; }
})(typeof window !== 'undefined' ? window : globalThis);
