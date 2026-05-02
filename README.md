# 🤖 AI Resume Analyzer — Full-Stack Microservices Project

A production-grade, fully containerized microservices system for analyzing resumes using AI.
Built with Node.js, React, Docker, Kubernetes, NGINX, Prometheus, and Grafana.

---

## 📐 Architecture Overview

```
Browser
   │
   ▼
[NGINX :80]  ──── API Gateway & Reverse Proxy
   │
   ├──► /api/auth/*    ──► [user-service :3001]
   ├──► /api/resume/*  ──► [resume-service :3002] ──► [ai-service :3003]
   ├──► /api/ai/*      ──► [ai-service :3003]
   └──► /*             ──► [frontend :80]

Monitoring:
   [Prometheus :9090] ──scrapes──► all services /metrics
   [Grafana :3000]    ──queries──► Prometheus
```

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── user-service/           # Auth microservice (JWT)
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── Dockerfile
│   └── package.json
├── resume-service/         # PDF upload & parsing
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/              # multer config
│   ├── Dockerfile
│   └── package.json
├── ai-service/             # Resume analysis engine
│   ├── routes/
│   ├── controllers/
│   ├── services/           # NLP skill extraction
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React UI
│   ├── src/
│   │   ├── pages/          # Login, Upload, Result
│   │   ├── utils/          # axios API client
│   │   └── App.js
│   ├── Dockerfile
│   └── nginx-frontend.conf
├── nginx/
│   └── nginx.conf          # API Gateway config
├── k8s/                    # Kubernetes manifests
│   ├── 00-namespace-config.yml
│   ├── 01-user-service.yml
│   ├── 02-ai-service.yml
│   ├── 03-resume-service.yml
│   └── 04-frontend-ingress.yml
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── provisioning/
├── .github/workflows/
│   └── ci-cd.yml           # GitHub Actions
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Running Locally with Docker

### Prerequisites
- Docker Desktop (with Compose v2)
- Git

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (JWT_SECRET is required)

# 3. Build and start ALL services
docker compose up --build

# 4. Access the app
open http://localhost         # React frontend
open http://localhost:9090    # Prometheus
open http://localhost:3000    # Grafana (admin / admin123)
```

### Stopping
```bash
docker compose down           # stop containers
docker compose down -v        # also remove volumes
```

---

## 🔌 API Flow (End-to-End)

### 1. Register a user
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
# Returns: { token: "eyJ..." }
```

### 2. Upload & analyze a resume
```bash
curl -X POST http://localhost/api/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
# Returns: { resume: { id, score, skills, suggestions, ... } }
```

### 3. Retrieve results
```bash
curl http://localhost/api/resume/{resumeId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Internal flow:
```
Client → NGINX → resume-service
  resume-service: parses PDF with pdf-parse
  resume-service: POST /api/ai/analyze to ai-service
  ai-service: extracts skills, scores resume
  ai-service: returns analysis JSON
  resume-service: saves + returns to client
```

---

## ☸️ Running in Kubernetes

### Prerequisites
- `kubectl` configured
- A running cluster (minikube, kind, or cloud)
- NGINX Ingress Controller installed

### Steps

```bash
# 1. Apply all manifests in order
kubectl apply -f k8s/00-namespace-config.yml
kubectl apply -f k8s/01-user-service.yml
kubectl apply -f k8s/02-ai-service.yml
kubectl apply -f k8s/03-resume-service.yml
kubectl apply -f k8s/04-frontend-ingress.yml

# 2. Update image names in YAML files:
# Replace YOUR_GITHUB_USERNAME with your actual username

# 3. Check pods are running
kubectl get pods -n ai-resume-analyzer

# 4. For minikube, enable ingress
minikube addons enable ingress

# 5. Get the ingress IP
kubectl get ingress -n ai-resume-analyzer

# 6. Add to /etc/hosts (for local testing)
echo "INGRESS_IP ai-resume-analyzer.local" >> /etc/hosts

# 7. Access at http://ai-resume-analyzer.local
```

---

## 📊 Monitoring

### Prometheus
- URL: http://localhost:9090
- Scrapes all three services every 15s
- Key metrics:
  - `resume_service_resumes_processed_total` — total uploads
  - `ai_service_analyses_completed_total` — total analyses
  - `*_http_request_duration_seconds` — latency histograms

### Grafana
- URL: http://localhost:3000
- Login: admin / admin123
- Dashboard auto-provisioned: **AI Resume Analyzer - Microservices Dashboard**
- Shows: request rates, P95 latency, heap usage, processed counts

---

## 🔄 CI/CD (GitHub Actions)

Pipeline: `.github/workflows/ci-cd.yml`

On every `push` to `main`:
1. **Test** — installs deps, runs lint/tests per service
2. **Build** — builds Docker images with layer caching
3. **Push** — pushes to GitHub Container Registry (`ghcr.io`)
4. **Integration Test** — spins up full stack, hits health endpoints

To enable image pushing, go to your GitHub repo → Settings → Actions → Allow write permissions.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express 4 |
| Frontend | React 18 |
| API Gateway | NGINX |
| Containerization | Docker, multi-stage builds |
| Orchestration | Docker Compose, Kubernetes |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PDF Parsing | pdf-parse |
| File Upload | multer |
| Metrics | prom-client |

---

## 📝 Notes for Production

- Replace in-memory stores with MongoDB or PostgreSQL
- Use Redis for JWT token blocklisting
- Enable HTTPS with Let's Encrypt (cert-manager in K8s)
- Add Horizontal Pod Autoscaler (HPA) for K8s
- Store secrets in Kubernetes Secrets or HashiCorp Vault
- Add request logging with Winston + ELK stack
