FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source
COPY . .

# Expose port
EXPOSE 8080

# Run the app
CMD ["bun", "run", "src/index.ts"]
