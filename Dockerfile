# Base image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# ---- Development Stage ----
FROM base AS development

# Install all dependencies (including devDependencies)
RUN yarn install

# Copy all files
COPY . .

# Set NODE_ENV
ENV NODE_ENV=development

# Expose development port
EXPOSE 9050

# Start development server with hot-reload
CMD ["yarn", "dev"]

# ---- Build Stage ----
FROM base AS builder

# Install all dependencies (including devDependencies)
RUN yarn install

# Copy all files
COPY . .

# Build the application
RUN yarn build

# ---- Production Stage ----
FROM base AS production

# Install only production dependencies
RUN yarn install --production

# Copy built files from build stage
COPY --from=builder /app/dist ./dist

# Set NODE_ENV
ENV NODE_ENV=production

# Expose production port
EXPOSE 9050

# Start the application
CMD ["yarn", "start"]