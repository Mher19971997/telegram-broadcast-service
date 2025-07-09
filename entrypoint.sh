#!/bin/sh

# Set NODE_ENV to production
export NODE_ENV=production


# Run npm migration
npm run migration:up

# Run pm2 with the provided configuration file
npm run start:prod