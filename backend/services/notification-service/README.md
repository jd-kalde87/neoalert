# NEOALERT Notification Service

        Independent microservice for the NEOALERT platform.

        ## Port
        `8009`

        ## Patterns
        adapter, retry, queue

        ## Key Endpoints
        - `POST /notifications/send` — Send notification
- `POST /notifications/email` — Send email
- `POST /notifications/push` — Send push notification
- `GET /notifications/{notification_id}` — Get notification status

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port 8009
        ```

        ## Tests
        ```bash
        pytest
        ```
