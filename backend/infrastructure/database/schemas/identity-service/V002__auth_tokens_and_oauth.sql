-- identity-service V002: email verification, password reset, OAuth fields

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_tenant_username
    ON users (tenant_id, username)
    WHERE username IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_google_id
    ON users (google_id)
    WHERE google_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(128) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_user
    ON email_verification_tokens (tenant_id, user_id, expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(128) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user
    ON password_reset_tokens (tenant_id, user_id, expires_at);
