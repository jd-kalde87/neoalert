class DomainException(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class AuthenticationError(DomainException):
    pass


class AuthorizationError(DomainException):
    pass


class NotFoundError(DomainException):
    pass


class ConflictError(DomainException):
    pass


class ValidationError(DomainException):
    pass
