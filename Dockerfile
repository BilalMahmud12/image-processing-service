# Base Image
FROM node:21-bullseye

# Install necessary build tools and libvips
RUN apt-get update && apt-get install -y \
    build-essential \
    libc6-dev \
    libvips-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json yarn.lock ./

# Install dependencies, ensure sharp works correctly
RUN yarn install --frozen-lockfile --ignore-engines

# Copy application code
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]