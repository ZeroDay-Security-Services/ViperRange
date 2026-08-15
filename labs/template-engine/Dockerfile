FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir tornado==6.4
COPY reporting.py .
ENV FLAG="VR{ssti_forges_the_session}"
ENV VAULT_KEY="vr-vault-9c1e5f"
ENV PORT=8888
EXPOSE 8888
CMD ["python", "reporting.py"]
