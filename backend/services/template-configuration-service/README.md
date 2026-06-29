# NEOALERT Template Configuration Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8008`

        ## Patterns
        versioning, canonical_mapping

        ## Key Endpoints
        - `POST /templates` — Create import template
- `GET /templates/{template_id}` — Get template
- `POST /templates/{template_id}/versions` — Create new version
- `GET /templates/structure/{structure_type}` — Get active template by structure

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8008
        ```

        ## Tests
        ```bash
        pytest
        ```
