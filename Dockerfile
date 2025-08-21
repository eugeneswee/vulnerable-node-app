FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create files directory for path traversal demo
RUN mkdir -p files && echo "This is a test file" > files/test.txt

# Expose port
EXPOSE 3000

# Add non-root user for security (ironic given the app's purpose)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Start application
CMD ["npm", "start"]
