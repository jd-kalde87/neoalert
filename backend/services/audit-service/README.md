# NEOALERT Audit Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8012`

        ## Patterns
        immutable_log, outbox

        ## Key Endpoints
        - `POST /audit/logs` — Record audit log entry
- `GET /audit/logs` — Query audit logs
- `GET /audit/logs/{entity_type}/{entity_id}` — Entity change history

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8012
        ```

        ## Tests
        ```bash
        pytest
        ```
