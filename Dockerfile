FROM node:20-alpine

WORKDIR /app

# Copy policy and middleware
COPY agent-policy.json /app/agent-policy.json
COPY middleware/package.json middleware/package-lock.json* /app/middleware/
COPY middleware/index.express.js /app/middleware/
COPY middleware/agent-policy.json /app/middleware/

# Install dependencies
WORKDIR /app/middleware
RUN npm install --production

# Expose port
EXPOSE 3000

# Start the middleware
CMD ["node", "index.express.js"]
