FROM python:3.11-slim

WORKDIR /app

COPY shared/observability /shared/observability
COPY shared/contracts /shared/contracts
RUN pip install --no-cache-dir /shared/observability /shared/contracts

COPY services/identity-service/pyproject.toml .
COPY services/identity-service/src ./src
COPY infrastructure/database/schemas/identity-service ./schemas/identity-service
RUN pip install --no-cache-dir \
    fastapi uvicorn pydantic pydantic-settings httpx \
    "sqlalchemy[asyncio]" asyncpg bcrypt PyJWT authlib "pydantic[email]"

ENV PYTHONPATH=/app/src
EXPOSE 8001

CMD ["uvicorn", "presentation.main:app", "--host", "0.0.0.0", "--port", "8001"]
