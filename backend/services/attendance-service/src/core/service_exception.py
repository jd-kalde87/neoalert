class ServiceException(Exception):
    def __init__(self, message: str, code: str = "SERVICE_ERROR") -> None:
        self.message = message
        self.code = code
        super().__init__(message)
