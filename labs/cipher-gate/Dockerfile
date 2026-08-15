FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY console.js .
COPY views/ ./views/
ENV FLAG="VR{obfuscation_hides_not_protects}"
ENV PORT=3000
EXPOSE 3000
CMD ["node", "console.js"]
