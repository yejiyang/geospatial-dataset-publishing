FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM nginx:1.28-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ ./
EXPOSE 80
