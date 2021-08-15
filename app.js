const http = require('http');
const fsPromises = require('fs/promises');

const hljs = require('highlight.js');
const markdown = require('markdown-it')(markdownOptions());

markdown.use(require('markdown-it-anchor'));
markdown.use(require('markdown-it-sub'));
markdown.use(require('markdown-it-sup'));
markdown.use(require('markdown-it-emoji'));
markdown.use(require('markdown-it-mark'));
markdown.use(require('markdown-it-task-lists'));
markdown.use(require('markdown-it-ins'));
markdown.use(require('@toycode/markdown-it-class'), markdownClass());
markdown.use(require('./@gerhobbelt/markdown-it-attrs'));

function markdownClass() {
    return {
        h1: 'heading',
        a: 'link'
    };
}

function markdownOptions() {
    return {
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
        xhtmlOut: false,
        quotes: `""''`, // «»‹›
        langPrefix: 'hljs language-',
        highlight: function (str, lang) {
            try {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(str, { language: lang }).value;
                } else {
                    return `<pre><code class="hljs">${hljs.highlightAuto(str).value}</code></pre>`;
                }
            } catch (err) {
                console.log({ highlight: err.message });
            }
        }
    };
}


http.createServer(async (req, res) => {
    try {
        if (req.url !== '/createmd') {
            let type = req.url.match(/\.html$/g) ? 'text/html'
                : req.url.match(/\.css$/g) ? 'text/css'
                    : req.url.match(/\.js$/g) ? 'application/javascript'
                        : req.url.match(/\.json$/g) ? 'application/json'
                            : req.url.match(/\.jpg$|\.png$/g) ? 'image/jpeg'
                                : req.url.match(/\.ico$/g) ? 'image/x-icon'
                                    : 'text/plain';

            if (req.url === '/') {
                req.url = '/index.html'
                type = 'text/html'
            }
            
            let data = await fsPromises.readFile(`./public${req.url}`);
            res.writeHead(200, { 'Content-Type': type });
            res.end(data);

        } else if (req.url === '/createmd') {
            if (req.method.toLowerCase() === 'post') {
                res.writeHead(200, { 'Content-Type': 'text/html' });

                let payload = '';
                req.on('data', data => {
                    payload += data;
                });
                req.on('end', () => {
                    res.end(markdown.render(payload.toString()));
                });
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': `${req.url} not allowed` }));
            }

        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<H1>404 Not Found</H1>`);
        }

    } catch (err) {
        res.end(err.message);
    }
}).listen(process.env.PORT || 3000, () => {
    console.log('\x1b[1;32mlistening on http://127.0.0.1:3000/\x1b[1;0m');
});


