FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This container is a worker script. 
# It can be run manually or via cron. 
# For indefinite running, we would need a loop or cron, 
# but for now we keep the 'run once' behavior or allow override.

CMD ["node", "index.js"]
