# One image: the Express API also serves the built SPA (see server/src/index.js).
# Node 24 is required for node:sqlite and for the seed script's native TypeScript imports.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY --from=build /app/dist ./dist
# The seed reads src/data/* and copies public/photos into the uploads dir.
COPY src/data ./src/data
COPY public/photos ./public/photos
ENV PORT=3001
ENV MAKITII_DB=/data/makitii.db
ENV MAKITII_UPLOADS=/data/uploads
VOLUME /data
EXPOSE 3001
# Seed is idempotent: it only fills an empty database.
CMD ["sh", "-c", "node --no-warnings server/src/seed.js && exec node --no-warnings server/src/index.js"]
