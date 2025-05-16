FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the build folder
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build"]
