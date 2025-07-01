const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const files = ['index.html', 'about.html', 'blog.html', 'fr/index.fr.html', 'ru/index.ru.html'];

async function extractContent(file) {
  try {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const title = document.querySelector('title')?.textContent.trim() || 'No title';
    const texts = [];
    [...document.querySelectorAll('main p, main h1, main h2, main h3')].forEach(el => {
      texts.push(el.textContent.trim());
    });
    const content = texts.join(' ').slice(0, 2000).replace(/\s+/g, ' ');
    const url = '/' + file.replace(/\\/g, '/');

    return { url, title, content };
  } catch (err) {
    console.error(`Failed to process ${file}:`, err);
    return null;
  }
}

async function generateSearchIndex() {
  const pages = [];

  for (const file of files) {
    const pageData = await extractContent(file);
    if (pageData) pages.push(pageData);
  }

  fs.writeFileSync('search-index.json', JSON.stringify(pages, null, 2));
  console.log('search-index.json generated with', pages.length, 'pages');
}

generateSearchIndex();
