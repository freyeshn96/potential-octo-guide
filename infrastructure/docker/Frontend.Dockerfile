FROM node:24-alpine AS build
WORKDIR /app
ARG FRONTEND
COPY frontend/${FRONTEND}/package.json frontend/${FRONTEND}/package-lock.json ./
RUN npm ci
COPY frontend/${FRONTEND}/ ./
ARG VITE_API_BASE_URL=/
ARG VITE_APP_BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_BASE_PATH=$VITE_APP_BASE_PATH
RUN npm run build

FROM nginx:1.28-alpine AS runtime
COPY infrastructure/docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
