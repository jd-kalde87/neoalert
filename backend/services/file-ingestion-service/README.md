# NEOALERT File Ingestion Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8007`

        ## Patterns
        strategy_reader, factory_processor, staging

        ## Key Endpoints
        - `POST /ingestion/upload` — Upload file for ingestion
- `GET /ingestion/{batch_id}/preview` — Preview staged records
- `POST /ingestion/{batch_id}/publish` — Publish validated records
- `GET /ingestion/{batch_id}/errors` — Get error log

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8007
        ```

        ## Tests
        ```bash
        pytest
        ```
