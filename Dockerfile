FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Empty string so all API calls become relative URLs — Next.js rewrites handle the proxy
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Baked at build time so Next.js routes-manifest.json gets the correct backend URL
ARG BACKEND_URL="http://backend:8000"
ENV BACKEND_URL=$BACKEND_URL

RUN pnpm build

# ---- runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

CMD ["pnpm", "start"]
