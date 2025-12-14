# Stage 1: Build the React app
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=test /app/app/test-results.json /app/app/test-results.json
COPY app ./app
WORKDIR /app/app
RUN npm install && npm run build

# Stage 1: Set up the server
FROM node:24-alpine
WORKDIR /app
COPY server ./server
COPY --from=build /app/app/dist ./app/dist
WORKDIR /app/server
RUN npm install
EXPOSE 3000
CMD ["node", "webserver.cjs"]