FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for some packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# We need to add aiosqlite or similar if we wanted, but standard sqlite is fine.
# We also remove psycopg2-binary since we use sqlite in the .env I created 
# (Or we can just keep it, it will install fine on 3.12)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite:///./cloudsim_docker.db

# Command to seed and then run
CMD ["sh", "-c", "python scripts/recreate_seed_database.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
