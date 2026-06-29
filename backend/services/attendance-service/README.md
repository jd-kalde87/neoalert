# NEOALERT Attendance Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8004`

        ## Patterns
        outbox, geofence_validation

        ## Key Endpoints
        - `POST /attendance/check-in` — Register check-in
- `POST /attendance/check-out` — Register check-out
- `POST /attendance/intermediate-exit` — Intermediate exit
- `GET /attendance/history/{employee_id}` — Attendance history

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8004
        ```

        ## Tests
        ```bash
        pytest
        ```
