FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY gatekeeper.js .
COPY public/ ./public/
ENV FLAG="VR{base64_is_not_encryption}"
ENV PORT=3000
EXPOSE 3000
CMD ["node", "gatekeeper.js"]
