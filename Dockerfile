# STAGE 1: Build the Next.js Frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# STAGE 2: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install Python for OpenEnv compliance
RUN apk add --no-cache python3 py3-pip

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 7860
EXPOSE 7860

# Install Python requirements
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy build artifacts and necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/inference.py ./inference.py
COPY --from=builder /app/next.config.js ./next.config.js

# Ensure local source files for API routes are present (Next.js needs them if not using standalone)
# In standard next start, we need the whole source or standalone output.
# Since we are not using standalone, we copy the whole src.
COPY --from=builder /app/src ./src

# Start the unified server on port 7860
CMD ["npm", "start"]
