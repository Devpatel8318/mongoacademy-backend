# Base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# ---- Dependencies Stage ----
FROM base AS dependencies

# Install all dependencies
RUN yarn install --frozen-lockfile

# ---- Development Stage ----
FROM dependencies AS development

# Set NODE_ENV
ENV NODE_ENV=development

# Expose development port
EXPOSE 9050

# Copy all files
COPY . .

# Start development server with hot-reload
CMD ["yarn", "dev"]

# ---- Build Stage ----
FROM dependencies AS builder

# Copy all files
COPY . .

# Build the application
RUN yarn build

# ---- Production Stage ----
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=production

# Expose production port
EXPOSE 9050

# Install only production dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copy built files from build stage
COPY --from=builder /app/dist ./dist

# Start the application
CMD ["yarn", "start"]