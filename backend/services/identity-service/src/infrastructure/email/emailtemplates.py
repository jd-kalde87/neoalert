def verification_email_subject() -> str:
    return "Verify your NEOALERT account"


def verification_email_link(frontend_url: str, token: str) -> str:
    return f"{frontend_url}/verify-email?token={token}"


def verification_email_body(frontend_url: str, token: str) -> str:
    link = verification_email_link(frontend_url, token)
    return (
        "Welcome to NEOALERT.\n\n"
        f"Please verify your email by clicking the link below:\n{link}\n\n"
        "If you did not create an account, ignore this message."
    )


def password_reset_email_subject() -> str:
    return "Reset your NEOALERT password"


def password_reset_email_link(frontend_url: str, token: str) -> str:
    return f"{frontend_url}/reset-password?token={token}"


def password_reset_email_body(frontend_url: str, token: str) -> str:
    link = password_reset_email_link(frontend_url, token)
    return (
        "You requested a password reset for your NEOALERT account.\n\n"
        f"Reset your password using this link:\n{link}\n\n"
        "If you did not request this, ignore this message."
    )
