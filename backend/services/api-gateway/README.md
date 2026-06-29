# NEOALERT API Gateway

        Independent microservice for the NEOALERT platform.

        ## Port
        `8000`

        ## Patterns
        circuit_breaker, rate_limiting

        ## Key Endpoints
        - `GET /gateway/routes` — List configured routes
- `POST /gateway/proxy/{path:path}` — Proxy request to downstream service

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8000
        ```

        ## Tests
        ```bash
        pytest
        ```
