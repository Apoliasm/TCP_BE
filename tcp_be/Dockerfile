# -------- deps --------
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile


# -------- build --------
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm prisma generate
# prisma client 생성


RUN pnpm build

# -------- runner --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

# 런타임에 필요한 것만
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
#dep에서 가져오는 것이 아닌 prisma client를 generate한 build에서 가져와야함
COPY --from=build /app/node_modules ./node_modules

# Prisma 쓰면 schema/migrations가 런타임에 필요할 수 있음(마이그레이션/생성)
COPY --from=build /app/prisma ./prisma

EXPOSE 4000
CMD ["node","dist/src/main.js"]

