from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InstanceCreate(BaseModel):
    id: str
    name: str
    type: str
    cpu: int
    memory: int


class InstanceRead(BaseModel):
    id: str
    name: str
    type: str
    state: str
    cpu: int
    memory: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
