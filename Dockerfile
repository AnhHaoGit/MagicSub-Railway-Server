# Node 20 (phù hợp với project của bạn)
FROM node:20-slim

# Cài ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json trước để cache npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy toàn bộ source
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "start"]
