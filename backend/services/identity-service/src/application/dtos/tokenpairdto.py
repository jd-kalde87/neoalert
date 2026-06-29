from dataclasses import dataclass


@dataclass
class TokenPairDTO:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800
