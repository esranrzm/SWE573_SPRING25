FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Serve static files using a simple web server
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build"]