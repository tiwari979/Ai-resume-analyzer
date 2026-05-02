const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const client = require('prom-client');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'resume_service_' });

const httpRequestDuration = new client.Histogram({
  name: 'resume_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const resumesProcessed = new client.Counter({
  name: 'resume_service_resumes_processed_total',
  help: 'Total number of resumes processed',
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Expose counter so controllers can use it
app.locals.resumesProcessed = resumesProcessed;

// Routes
app.use('/api/resume', resumeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'resume-service', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[resume-service] Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[resume-service] Running on port ${PORT}`);
});

module.exports = app;
