# Build the proxy, then ship only the runtime it needs.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# The MCP Registry proves we own this image by reading this label off the final
# image's config. It must sit in the runtime stage: a label set in the build
# stage never reaches the image that gets pushed.
LABEL io.modelcontextprotocol.server.name="io.github.getanyapi-com/anyapi"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# Speaks MCP over stdio. ANYAPI_API_KEY is optional: discovery and tools/list
# work without one, and only tools/call needs a credential.
ENTRYPOINT ["node", "dist/index.js"]
