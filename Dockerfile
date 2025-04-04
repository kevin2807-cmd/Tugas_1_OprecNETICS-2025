# Stage 1: Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Stage 2: Run Stage
FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["node", "server.js"]
