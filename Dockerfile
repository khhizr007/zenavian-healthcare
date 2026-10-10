# --- build the static site ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG SITE_URL=http://localhost:8080
ENV SITE_URL=$SITE_URL
RUN npm run build

# --- tiny runtime: static files + demo form endpoints ---
FROM node:22-alpine
WORKDIR /srv
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/dist ./dist
COPY docker/server.mjs ./server.mjs
USER node
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/ >/dev/null || exit 1
CMD ["node", "server.mjs"]