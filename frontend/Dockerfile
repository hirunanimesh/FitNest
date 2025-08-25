# Use the official Node.js 20 runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy environment file
COPY .env ./

# Set environment variables for build
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3010

# Define the command to run the application
CMD ["npm", "start", "--", "-p", "3010"]
