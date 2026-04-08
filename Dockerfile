FROM node:18-alpine

# Hugging Face requires the application to listen precisely on port 7860
ENV PORT=7860
EXPOSE 7860

WORKDIR /app

# We are only deploying the Backend API to Hugging Face
# so we copy only the backend dependency file.
COPY backend/package*.json ./
RUN npm install

# Copy all the backend logic
COPY backend/ .

# Compile the TypeScript files into the dist/ directory
RUN npm run build

# Start the Express REST API
CMD ["npm", "start"]
