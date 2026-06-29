# NEOALERT Tenant Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8002`

        ## Patterns
        multi_tenant

        ## Key Endpoints
        - `POST /tenants` — Create tenant
- `GET /tenants/{tenant_id}` — Get tenant by ID
- `PATCH /tenants/{tenant_id}/config` — Update tenant config
- `GET /tenants/{tenant_id}/branding` — Get tenant branding

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8002
        ```

        ## Tests
        ```bash
        pytest
        ```
