# FROM python:3.6-slim-buster

# WORKDIR /app

# COPY requirements.txt ./

# RUN pip install -r requirements.txt

# COPY . .

# EXPOSE 4000

# CMD [ "flask", "run", "--host=0.0.0.0", "--port=4000"]

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    FLASK_APP=app.py \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=4000

# minimal OS deps; add build-essential/libpq-dev only if you compile native wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 4000
CMD ["flask", "run"]