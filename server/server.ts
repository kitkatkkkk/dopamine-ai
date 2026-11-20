import http from 'node:http';
import { generateAiResponse, isAiConfigured, getActiveModel } from './aiService.ts';
import type { ChatRequest } from '../src/types/chat.ts';

/**
 * DOPAMINE AI - Backend API Server
 * Lightweight, zero-dependency Node.js HTTP server.
 * Can be easily integrated into Express, Next.js, or Supabase Edge Functions.
 */

const PORT = parseInt(process.env.PORT || '3001', 10);

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  // Health check
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'DOPAMINE AI Backend',
      configured: isAiConfigured(),
      activeModel: getActiveModel(),
      demoMode: !isAiConfigured(),
      timestamp: new Date().toISOString(),
    });
  }

  // Psychologist booking demo endpoint (DOPAMINE CONNECT)
  if (req.method === 'POST' && url.pathname === '/api/connect-psychologist') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        // Purely fictional demo confirmation
        sendJson(res, 200, {
          success: true,
          isDemo: true,
          notice: 'Демонстрациялық жазба / Демонстрационная запись',
          messageKk: 'Рахмет! Өтінішің қабылданды (демо). Қызылорда студенттер психологиялық қолдау орталығының маманы саған жақын арада хабарласады.',
          messageRu: 'Спасибо! Ваша заявка принята (демо). Специалист службы психологической поддержки свяжется с вами.',
          bookingDetails: {
            id: 'DEMO-' + Math.floor(1000 + Math.random() * 9000),
            institution: payload.institution || 'Қорқыт Ата атындағы Қызылорда университеті',
            preferredTime: payload.preferredTime || '15:00',
            status: 'Демо-кеңес жоспарланды',
          },
        });
      } catch (e: any) {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  // Main Chat endpoint
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const requestData: ChatRequest = JSON.parse(body || '{}');

        // Validation for empty message
        if (!requestData || typeof requestData.message !== 'string') {
          return sendJson(res, 400, {
            error: 'Параметр message міндетті / Message is required',
          });
        }

        const response = await generateAiResponse(requestData);
        return sendJson(res, 200, response);
      } catch (err: any) {
        console.error('[DOPAMINE AI Server Error]', err);
        return sendJson(res, 500, {
          error: 'Серверлік қате орын алды / Internal server error',
          details: err?.message || 'Unknown error',
        });
      }
    });
    return;
  }

  // Not found
  sendJson(res, 404, { error: 'Endpoint not found' });
});

export function startServer() {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🧠 DOPAMINE AI Backend Server is running!`);
    console.log(`🚀 Port: http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - POST http://localhost:${PORT}/api/chat`);
    console.log(`   - GET  http://localhost:${PORT}/api/health`);
    console.log(`   - POST http://localhost:${PORT}/api/connect-psychologist`);
    console.log(`🔑 Live AI Configured: ${isAiConfigured() ? 'YES (' + getActiveModel() + ')' : 'NO (Scripted Demo Mode Active)'}`);
    console.log(`======================================================\n`);
  });
}

// Start immediately when run directly
startServer();

export default server;
