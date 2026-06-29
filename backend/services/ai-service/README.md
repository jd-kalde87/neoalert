# NEOALERT AI Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8011`

        ## Patterns
        adapter, strategy

        ## Key Endpoints
        - `POST /ai/classify` — Auto classification
- `POST /ai/summarize` — Generate summary
- `POST /ai/anomaly-detect` — Anomaly detection
- `POST /ai/narrative` — Narrative report

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8011
        ```

        ## Tests
        ```bash
        pytest
        ```
