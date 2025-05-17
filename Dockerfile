# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN npm install --frozen-lockfile --silent

COPY . .

# Build the Vite React application
RUN npm run build

# List contents of dist to verify build output
RUN ls -al /app/dist

# --- Stage 2: Serve the Static Files ---
FROM node:20-alpine AS serve-stage

# Install 'serve' globally.
RUN npm install -g serve

# Copy the built application from the 'build' stage
COPY --from=build /app/dist /app/dist

WORKDIR /app/dist

# Set the PORT environment variable
ENV PORT=8080

# Expose the port that Cloud Run expects (8080 by default)
EXPOSE 8080

# Command to run the 'serve' application
CMD ["serve", "-s", "-l", "8080"]