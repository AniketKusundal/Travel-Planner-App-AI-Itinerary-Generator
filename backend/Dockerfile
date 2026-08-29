# Uses the official Node.js 22 image as the base image.
FROM node:22  

# Creates (if it doesn't exist) and sets /app as the working directory inside the container.
WORKDIR /app

# Copies package.json and package-lock.json into /app.
COPY package*.json ./

# Installs all project dependencies inside the Docker image.
RUN npm install


# Copies the remaining project files into /app.
COPY . .

# Indicates that the application inside the container listens on port 5000.
EXPOSE 5000


# Runs npm start automatically when the container starts.
CMD ["npm" , "start"]