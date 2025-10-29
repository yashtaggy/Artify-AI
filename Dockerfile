# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps - use npm ci if you have package-lock.json
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --silent

# Copy rest of the files
COPY . .

# Build the Next.js app
ENV NODE_ENV=production
RUN npm run build

# Remove dev-only files to reduce image size (optional)
RUN rm -rf node_modules
RUN npm ci --only=production --silent

# ---------- STAGE 2: RUN ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Create a non-root user for better security (optional)
RUN addgroup -S craft && adduser -S craft -G craft

# Copy production node_modules and built app from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
# COPY --from=builder /app/next-i18next.config.js ./ 2>/dev/null || true

# Expose port and run
ENV PORT 8080
EXPOSE 8080

USER craft

# Note: next start listens on $PORT when passed with -p
CMD ["npx", "next", "start", "-p", "8080"]
