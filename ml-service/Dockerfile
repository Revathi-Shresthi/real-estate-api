# ─────────────────────────────────────────────────────────────────────────────
# ml-service/Dockerfile
# Python Flask service for real-estate price prediction
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────────────────
# wget is needed for the HEALTHCHECK command
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

# ── Non-root user (security best practice) ───────────────────────────────────
RUN groupadd -r mlgroup && useradd -r -g mlgroup mluser

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
# Copy requirements first so Docker can cache this layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source ────────────────────────────────────────────────────────
COPY . .

# ── Pre-train the model at build time ────────────────────────────────────────
# Creates model/model.pkl and model/le_*.pkl inside the image
RUN python train.py

# ── Permissions ───────────────────────────────────────────────────────────────
RUN chown -R mluser:mlgroup /app
USER mluser

# ── Port ──────────────────────────────────────────────────────────────────────
EXPOSE 5001

# ── Health check ─────────────────────────────────────────────────────────────
# Required by docker-compose.yml:  depends_on: ml-service: condition: service_healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5001/health || exit 1

# ── Start Flask ───────────────────────────────────────────────────────────────
CMD ["python", "app.py"]