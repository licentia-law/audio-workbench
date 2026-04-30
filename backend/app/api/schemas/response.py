from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str


class ApiResponse(BaseModel, Generic[T]):
    ok: bool
    message: str
    data: Optional[T]
    error: Optional[ErrorDetail]

    @classmethod
    def success(cls, data: T, message: str = "success") -> "ApiResponse[T]":
        return cls(ok=True, message=message, data=data, error=None)

    @classmethod
    def failure(cls, code: str, message: str) -> "ApiResponse[None]":
        return cls(ok=False, message=message, data=None, error=ErrorDetail(code=code))
