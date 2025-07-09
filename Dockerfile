# Use Node.js v14 as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm ci

# Build the NestJS application
RUN npm run build

# Expose port 6001
EXPOSE 6001

# Command to run the application
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh
RUN [ -f ./entrypoint.sh ] && chmod +x ./entrypoint.sh || true

# Define the entrypoint, ensure entrypoint.sh exists
ENTRYPOINT ["./entrypoint.sh"]