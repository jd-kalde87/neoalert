# NEOALERT Reporting Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8010`

        ## Patterns
        repository

        ## Key Endpoints
        - `GET /reports/kpis` — Get KPI aggregates
- `POST /reports/exports` — Create export job
- `GET /reports/dashboard` — Dashboard data
- `GET /reports/heatmap` — Incident heatmap integration

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8010
        ```

        ## Tests
        ```bash
        pytest
        ```
