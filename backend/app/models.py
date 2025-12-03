from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from .db import Base


class Instance(Base):
    __tablename__ = "instances"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    state = Column(String, default="creating")
    cpu = Column(Integer, nullable=False)
    memory = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
