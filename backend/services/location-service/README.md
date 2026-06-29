# NEOALERT Location Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8005`

        ## Patterns
        repository

        ## Key Endpoints
        - `POST /locations/traces` — Record location trace
- `GET /locations/last/{employee_id}` — Last known location
- `GET /locations/geofences` — List geofences
- `GET /locations/heatmap` — Heatmap data

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8005
        ```

        ## Tests
        ```bash
        pytest
        ```
