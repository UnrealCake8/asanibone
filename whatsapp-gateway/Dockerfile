FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
ENV BAILEYS_AUTH_DIR=/data/baileys
VOLUME ["/data/baileys"]
EXPOSE 3001
CMD ["npm", "run", "start"]
