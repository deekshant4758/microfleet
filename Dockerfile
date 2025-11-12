# Stage 1: Dependencies and Build (Builder Stage)
FROM node:18-alpine AS builder

# 1. Install necessary system dependencies (like openssl for Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# 2. Copy package files first for better layer caching
COPY package*.json ./
# Install ALL dependencies (dev and prod) because 'prisma generate' is a build step
# which requires the full 'prisma' package (often a dev dependency).
RUN npm install

# 3. Copy the schema/prisma directory
# This ensures 'npx prisma generate' can find the schema.prisma file.
# Based on your structure: prisma/schema.prisma
COPY prisma/ ./prisma/

# 4. Generate Prisma Client
# This generates the client in the node_modules folder of the builder stage.
RUN npx prisma generate --no-engine

# --- Production Ready Stage (Smaller Image) ---
FROM node:18-alpine AS production

# 5. Set working directory
WORKDIR /app

# 6. Copy ONLY production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
# Copy the generated client file structure (prisma folder)
COPY --from=builder /app/prisma ./prisma

# 7. Copy the rest of the application source code
# This should copy src/, docker-compose.yaml, etc.
COPY . .

# 8. Use the production dependencies only from package.json for the runtime environment
# We install --production here to clean up any leftover dev dependencies that might have been accidentally copied
# NOTE: If you are sure npm install in step 2 only installed what's needed, this step is optional.
# RUN npm install --production --prefer-offline --no-cache

EXPOSE 8080

CMD ["npm", "start"]