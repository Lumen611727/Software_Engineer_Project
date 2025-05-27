const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 8000;
const FILES_DIR = path.join(__dirname, 'files');
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg', // Changed to jpeg for consistency
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/x-font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.ico': 'image/x-icon'
};

if(!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
    console.log(`Cannot find directory ${FILES_DIR}, automatically create one`);
}

const server = http.createServer((req, res) => {
    if(req.method == 'POST' && req.url == '/save') {
        let body = '';
        req.on('data', chunk => {body += chunk.toString()} )

        req.on('end', () => {
            try {
                const { filename, code } = JSON.parse(body);

                const safeFilename = path.basename(filename || 'untitled.txt');
                const filePath = path.join(FILES_DIR, safeFilename);

                if (typeof code !== 'string') {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Invalid content.');
                    return;
                }

                fs.writeFile(filePath, code, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Server error: Could not save file.');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(`File '${safeFilename}' saved successfully.`);
                    console.log(`File saved: ${filePath}`);
                });
            } catch (e) {
                console.error('Error processing upload:', e);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad request (e.g., invalid JSON).');
            }
        });
    }
    else if (req.method === 'GET' && req.url.startsWith('/load')) {
    const queryObject = querystring.parse(req.url.split('?')[1]);
    const filename = queryObject.filename;

    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Filename query parameter is required.');
        return;
    }

    const safeFilename = path.basename(filename);
    const filePath = path.join(FILES_DIR, safeFilename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found.');
            } else {
                console.error('Error reading file:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error: Could not read file.');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' }); // Send as plain text
        res.end(data);
        console.log(`File sent: ${filePath}`);
    });
    }
    else if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, htmlContent) => {
            if (err) {
                console.error('Error reading index.html:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error: Could not load HTML page.');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        });
    }
    else if (req.method === 'GET' && req.url.startsWith('/dist/')) {
        const relativeFilePath = req.url.substring('/'.length);
        const filePath = path.join(__dirname, relativeFilePath);
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        console.log(contentType);
        
        fs.readFile(filePath, (err, htmlContent) => {
            if (err) {
                console.error('Error reading bundle.js:', err);
                res.writeHead(500, { 'Content-Type': contentType });
                res.end('Server error: Could not load bundle.js.');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(htmlContent);
        });
    }
    // --- Not Found ---
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found. Visit / to use the file editor.');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Files will be stored in/served from: ${FILES_DIR}`);
});