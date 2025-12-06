# OPUS 67 Python Sandbox for HumanEval Execution
# Safe, isolated environment for code evaluation

FROM python:3.11-slim

# Set working directory
WORKDIR /sandbox

# Install common Python packages for HumanEval
RUN pip install --no-cache-dir \
    pytest==7.4.0 \
    numpy==1.26.0 \
    typing-extensions==4.8.0

# Copy executor script
COPY executor.py /sandbox/executor.py

# Security: Run as non-root user
RUN useradd -m -s /bin/bash sandbox && \
    chown -R sandbox:sandbox /sandbox
USER sandbox

# Set resource limits via Docker run flags
# --memory=256m --cpus=0.5 --network=none

ENTRYPOINT ["python", "/sandbox/executor.py"]
