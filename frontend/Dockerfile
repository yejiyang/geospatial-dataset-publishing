FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY build.js ./
RUN npm ci
COPY src ./src

# Build with the API_BASE_URL environment variable if provided
ARG API_BASE_URL
ENV API_BASE_URL=${API_BASE_URL}
RUN npm run build

FROM nginx:1.29-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ ./
EXPOSE 80
