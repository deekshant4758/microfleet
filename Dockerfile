# Stage 1: Dependencies and Build (Builder Stage)
FROM node:18-alpine AS builder

# 1. Install necessary system dependencies (like openssl for Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma/ ./prisma/

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