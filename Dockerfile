FROM node:18-alpine

# Install Python and Pip for OpenEnv compliance
RUN apk add --no-cache python3 py3-pip

# Hugging Face Spaces strictly maps its traffic through port 7860
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

WORKDIR /app

# Copy root Next.js dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy all the Next.js Fullstack code + OpenEnv scripts
COPY . .

# Compile Next.js build
RUN npm run build

# Start the unified Next.js FullStack Server on port 7860
CMD ["npm", "start"]
