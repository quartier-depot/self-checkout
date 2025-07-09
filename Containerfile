# Stage 1: Install and test the React app
FROM node:24-alpine AS test
WORKDIR /app
COPY app ./app
WORKDIR /app/app
RUN npm install
RUN npx vitest run --reporter default --reporter json --outputFile.json=./test-results.json

# Stage 2: Build the React app
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=test /app/app/test-results.json /app/app/test-results.json
COPY app ./app
WORKDIR /app/app
RUN npm install && npm run build

# Stage 3: Set up the server
FROM node:24-alpine
WORKDIR /app
COPY server ./server
COPY --from=build /app/app/dist ./app/dist
WORKDIR /app/server
RUN npm install
EXPOSE 3000
CMD ["node", "webserver.cjs"]