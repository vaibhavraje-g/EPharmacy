# Use Node.js LTS version
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the service port
EXPOSE 3003

# Command to run the application
CMD ["node", "app.js"]
