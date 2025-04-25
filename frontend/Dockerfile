# frontend/Dockerfile

# --- Stage 1: Build the React application ---
# Use an official Node runtime as a parent image (Alpine for smaller size)
FROM node:18-alpine AS builder

# --- Add ARG to receive build argument from docker-compose ---
# This defines an argument that can be passed during the build process
ARG REACT_APP_API_BASE_URL

# --- Set ENV variable within the build stage using the ARG ---
# This makes the argument available as an environment variable
# for the 'npm run build' command process.
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# Copy these first to leverage Docker cache for dependencies
COPY package.json package-lock.json* ./
# If using yarn:
# COPY package.json yarn.lock ./

# Install dependencies using npm ci for potentially faster/more reliable installs
# Fallback to npm install if package-lock.json is not perfectly synced
RUN npm ci || npm install
# If using yarn:
# RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the React app for production
# The build process will use the REACT_APP_API_BASE_URL environment variable set above
RUN npm run build

# --- Stage 2: Serve the built application with Nginx ---
# Use an official lightweight Nginx image
FROM nginx:stable-alpine AS final

# Remove default Nginx welcome page configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file from the project context
# This file (nginx.conf) should be in the same directory as this Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build output from the 'builder' stage (/app/build) 
# into Nginx's default html directory to be served
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default HTTP port)
EXPOSE 80

# Start Nginx in the foreground when the container launches
CMD ["nginx", "-g", "daemon off;"]

