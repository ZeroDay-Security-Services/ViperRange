FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY relay.js .
COPY public/ ./public/
ENV FLAG="VR{css_comments_are_not_secrets}"
ENV PORT=3000
EXPOSE 3000
CMD ["node", "relay.js"]
