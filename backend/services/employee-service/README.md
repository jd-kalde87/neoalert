# NEOALERT Employee Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8003`

        ## Patterns
        repository

        ## Key Endpoints
        - `POST /employees` — Create employee
- `GET /employees/{employee_id}` — Get employee
- `GET /employees` — List employees
- `POST /employees/{employee_id}/assignments` — Assign to site

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8003
        ```

        ## Tests
        ```bash
        pytest
        ```
