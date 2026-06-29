FROM python:3.11-slim

WORKDIR /app

COPY shared/observability /shared/observability
COPY shared/contracts /shared/contracts
RUN pip install --no-cache-dir /shared/observability /shared/contracts

COPY services/audit-service/pyproject.toml .
COPY services/audit-service/src ./src
RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings httpx

ENV PYTHONPATH=/app/src
EXPOSE 8012

CMD ["uvicorn", "presentation.main:app", "--host", "0.0.0.0", "--port", "8012"]
