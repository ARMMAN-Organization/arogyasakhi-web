# Build the static bundle, then serve it via nginx.
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite inlines VITE_* vars into the bundle at build time — must be supplied
# via --build-arg (e.g. --build-arg VITE_API_BASE_URL=https://api.armman.org/api/v1).
# Fail fast here rather than shipping an image whose bundle throws in the browser.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL" || (echo "ERROR: VITE_API_BASE_URL build-arg is required" >&2 && exit 1)

RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
