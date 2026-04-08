FROM node:18-alpine

# Hugging Face Spaces strictly maps its traffic through port 7860
ENV PORT=7860
EXPOSE 7860

WORKDIR /app

# Copy root Next.js dependencies
COPY package*.json ./

# Install dependecies
RUN npm install

# Copy all the Next.js Fullstack code
COPY . .

# Compile Next.js build
RUN npm run build

# Start the unified Next.js FullStack Server on port 7860
CMD ["npm", "start"]
