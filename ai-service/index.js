const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const client = require('prom-client');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'ai_service_' });

const httpRequestDuration = new client.Histogram({
  name: 'ai_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const analysesCompleted = new client.Counter({
  name: 'ai_service_analyses_completed_total',
  help: 'Total AI analyses completed',
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large text payloads

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

app.locals.analysesCompleted = analysesCompleted;

// Routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ai-service] Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[ai-service] Running on port ${PORT}`);
});

module.exports = app;
