# CRUD API

## Description

Simple CRUD API using an in-memory database.

## Installation

1. Clone the repository: `git clone https://github.com/snischuk/crud-api.git`
2. Switch to the `dev` branch: `git switch dev`
3. Install dependencies: `npm install`

## Running the Application

- **Development Mode**: `npm run start:dev`  
  Starts the application in development mode using **nodemon** to watch for changes in the `src` directory and restart the application accordingly.  
  It executes TypeScript files directly using **ts-node**.  
  The entry point for the application in development mode is `src/index.ts`.

- **Production Mode**: `npm run start:prod`  
  Starts the application in production mode using the compiled JavaScript files.  
  It executes the `dist/index.js` file.  
  The entry point for the application in production mode is `dist/index.js`.

- **Multi-Node Development Mode**: `npm run start:multi:dev`  
  Starts the application in multi-node development mode using **nodemon** to watch for changes in the `src` directory and restart the application accordingly.  
  It executes TypeScript files directly using **ts-node**.  
  The entry point for the application in multi-node development mode is `src/cluster.ts`.

- **Multi-Node Production Mode**: `npm run start:multi:prod`  
  Starts the application in multi-node production mode using the compiled JavaScript files.  
  It executes the `dist/cluster.js` file.  
  The entry point for the application in multi-node production mode is `dist/cluster.js`.

## Testing

- `npm test`  
  Runs the tests using **Jest**.

## Linting

- `npm run lint`  
  Runs **ESLint** on TypeScript files in the `src` directory and applies fixes where possible.

## Formatting

- `npm run format`  
  Runs **Prettier** on TypeScript, JSON, and Markdown files in the `src` directory and applies formatting changes.

## Requirements

- Use Node.js **v24.x.x** (24.10.0 or higher).
