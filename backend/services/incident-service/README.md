# NEOALERT Incident Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8006`

        ## Patterns
        outbox, domain_events

        ## Key Endpoints
        - `POST /incidents` — Create incident
- `GET /incidents/{incident_id}` — Get incident
- `PATCH /incidents/{incident_id}/status` — Update status
- `GET /incidents/geo/search` — Geographic query

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8006
        ```

        ## Tests
        ```bash
        pytest
        ```
