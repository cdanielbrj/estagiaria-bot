FROM node:22-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM dependencies AS test
COPY src ./src
COPY test ./test
RUN npm test
CMD ["npm", "test"]

FROM dependencies AS runtime
ARG APP_REVISION=development
LABEL org.opencontainers.image.title="Aira Gatse" org.opencontainers.image.revision=$APP_REVISION
ENV APP_REVISION=$APP_REVISION
ENV NODE_ENV=production HEALTH_HOST=0.0.0.0
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+(process.env.HEALTH_PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/main.js"]
