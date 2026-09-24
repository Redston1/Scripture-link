const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseReference:parse} = require('../reference.js');
const books = require('../books.js');
test('word ordinals, exact verses and official URL', () => {
 assert.equal(parse('first nephi 11:17').url,'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/11?lang=eng&id=p17#p17');
});
test('ranges and lists', () => {
 assert.match(parse('John 3:16–17, 19').url,/&id=p16-p17,p19#p16$/);
});
test('all books resolve with valid metadata', () => {
 for (const book of books) {
  assert.match(parse(`${book.name} 1:1`).url,new RegExp(`/${book.slug}/1\\?`));
  assert.doesNotThrow(() => parse(`${book.name} ${book.counts.length}:${book.counts.at(-1)}`));
 }
});
test('common aliases and single chapter works', () => {
 for (const ref of ['D&C 6:36','Psalm 23:1','JS-H 1:17','Articles of Faith 1:13','Song of Solomon 1:1','Second Timothy 1:7']) assert.doesNotThrow(() => parse(ref));
});
test('chapter only', () => assert.match(parse('Alma 32').url,/\/alma\/32\?lang=eng$/));
test('invalid or nonexistent references fail', () => {
 for (const ref of ['', 'Nephi 11:17','John 0:1','John 22:1','1 Nephi 11:37','John 3:17-16','John 3:0','John 3:16,','<script> 1:1','Moses 1:999']) assert.throws(() => parse(ref),ref);
});
const {parseInput} = require('../reference.js');
test('share links preserve paragraph selections, language, and fragments', () => {
 for (const url of [
  'https://www.churchofjesuschrist.org/study/general-conference/2023/10/51nelson?lang=eng&id=p7-p9#p7',
  'https://www.lds.org/general-conference/2018/04/revelation-for-the-church-revelation-for-our-lives?lang=eng&para=10#p10',
  'https://www.churchofjesuschrist.org/study/manual/example/lesson?lang=spa&id=p_abC-p_deF#p_abC',
  'http://lds.org/go/example?x=a%2Fb&lang=eng#12',
  'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/11?lang=eng&id=p17#p17'
 ]) assert.equal(parseInput('  '+url+'  ').url,url);
});
test('bare Church URLs and existing scripture input', () => {
 assert.equal(parseInput('www.lds.org/go/example#p1').url,'https://www.lds.org/go/example#p1');
 assert.deepEqual(parseInput('first Nephi 11:17'),parse('first Nephi 11:17'));
});
test('reject unsafe, unrelated, malformed, and oversized share links', () => {
 for (const url of ['javascript:alert(1)','https://example.com/talk','https://lds.org.evil.com/talk','https://notlds.org/talk','https://lds.org@evil.com/talk','https://user@lds.org/talk','ftp://lds.org/talk','https://lds.org:444/talk','https://lds.org/talk some text','https://lds.org/'+'a'.repeat(2000)]) assert.throws(()=>parseInput(url),url);
});
