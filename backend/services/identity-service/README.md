# NEOALERT Identity Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8001`

        ## Patterns
        jwt, rbac

        ## Key Endpoints
        - `POST /auth/login` — Authenticate user
- `POST /auth/refresh` — Refresh access token
- `POST /auth/mfa/verify` — Verify MFA code
- `GET /auth/sessions` — List active sessions

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8001
        ```

        ## Tests
        ```bash
        pytest
        ```
