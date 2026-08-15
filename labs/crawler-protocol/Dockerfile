FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask==3.0.3
COPY gateway.py .
COPY landing.html .
COPY robots.txt .
ENV FLAG="VR{robots_txt_is_a_suggestion}"
ENV PORT=5000
EXPOSE 5000
CMD ["python", "gateway.py"]
