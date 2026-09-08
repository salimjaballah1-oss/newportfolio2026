# Stage 1 — build du front
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 — dépendances du service d'upload HD → S3
FROM node:22-alpine AS upload-deps

WORKDIR /svc

COPY s3-upload-service/package*.json ./
RUN npm ci --omit=dev

# Stage 3 — image finale : nginx (sert le front) + Node (upload HD, interne)
FROM nginx:alpine

RUN apk add --no-cache nodejs

# Front statique
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Service d'upload HD → S3 (jamais exposé directement, voir entrypoint.sh + nginx.conf)
COPY --from=upload-deps /svc/node_modules /srv/s3-upload-service/node_modules
COPY s3-upload-service/server.js /srv/s3-upload-service/server.js
COPY s3-upload-service/package.json /srv/s3-upload-service/package.json

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
