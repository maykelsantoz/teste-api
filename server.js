const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3737;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Debug
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ======================== PROXY MELHORADO (anti-525) ========================
app.post('/api/proxy', async (req, res) => {
  console.log('[PROXY] Recebido →', req.body.url);

  const { url, method = 'GET', headers = {}, body } = req.body;

  if (!url) {
    return res.status(400).json({ ok: false, error: "URL é obrigatória" });
  }

  try {
    const options = {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ...headers
      },
      // Configurações importantes para SSL
      redirect: 'follow',
      signal: AbortSignal.timeout(15000) // timeout de 15 segundos
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const start = Date.now();
    const response = await fetch(url, options);
    const elapsed = Date.now() - start;

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    let parsed = null;
    if (contentType.includes('application/json')) {
      try {
        parsed = JSON.parse(text);
      } catch (_) {}
    }

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    console.log(`[PROXY] Resposta → Status ${response.status}`);

    res.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      elapsed,
      contentType,
      headers: responseHeaders,
      body: parsed ?? text,
      raw: text,
    });
  } catch (err) {
    console.error("[PROXY] Erro:", err.message);
    res.status(502).json({
      ok: false,
      error: err.message,
      status: 502
    });
  }
});

// ======================== EXECUTE ========================
app.post('/api/execute', async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) {
    return res.status(400).json({ error: "Código não pode estar vazio" });
  }

  const logs = [];
  const requests = [];

  const customConsole = {
    log: (...args) => logs.push({ level: 'log', msg: args.map(a =>
      typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ') }),
    error: (...args) => logs.push({ level: 'error', msg: args.map(a =>
      typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ') }),
    warn: (...args) => logs.push({ level: 'warn', msg: args.map(a => String(a)).join(' ') }),
    info: (...args) => logs.push({ level: 'info', msg: args.map(a => String(a)).join(' ') }),
  };

  const proxyFetch = async (url, options = {}) => {
    const start = Date.now();
    try {
      const proxyResponse = await fetch(`http://localhost:${PORT}/api/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method: options.method || 'GET',
          headers: options.headers || {},
          body: options.body
        })
      });

      const data = await proxyResponse.json();
      const elapsed = Date.now() - start;

      requests.push({
        url,
        method: options.method || 'GET',
        status: data.status || 0,
        elapsed
      });

      if (!data.ok) {
        throw new Error(`HTTP ${data.status}: ${data.error || data.body?.substring(0, 100) || 'Erro na API'}`);
      }

      return {
        ok: data.status >= 200 && data.status < 300,
        status: data.status,
        statusText: data.statusText || '',
        headers: new Headers(Object.entries(data.headers || {})),
        text: async () => data.raw,
        json: async () => typeof data.body === 'string' ? JSON.parse(data.body) : data.body,
      };
    } catch (err) {
      requests.push({ url, method: options.method || 'GET', status: 0, elapsed: Date.now() - start });
      throw err;
    }
  };

  try {
    const AsyncFunction = async function () {}.constructor;
    const userFunction = new AsyncFunction('fetch', 'console', `"use strict";\n${code}\n`);

    const result = await userFunction(proxyFetch, customConsole);

    res.json({ result: result !== undefined ? result : null, logs, requests });

  } catch (err) {
    console.error("Erro na execução:", err);
    res.json({ error: err.message, logs, requests });
  }
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📌 Teste com o código abaixo no editor\n`);
});
