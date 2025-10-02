#!/usr/bin/env node
// Force deployment script - creates a minor change to trigger rebuild
const fs = require('fs');
const path = require('path');

const deploymentFile = path.join(__dirname, 'DEPLOYMENT_TRIGGER.md');
const timestamp = new Date().toISOString();

const content = `# Deployment Trigger

Last deployment trigger: ${timestamp}

This file is used to force Vercel deployments when needed.

## Changes in this deployment:
- Fixed admin authentication system
- Updated NEXT_PUBLIC_SITE_URL to use https://rehobothcc.ca
- Fixed email service URL generation
- Enhanced error handling and debugging
- Fixed invitation validation system

Build should succeed as it passes locally.
`;

fs.writeFileSync(deploymentFile, content);
console.log('✅ Created deployment trigger file');
console.log('📝 Please commit and push this change to trigger a new deployment');
console.log('');
console.log('Commands to run:');
console.log('git add DEPLOYMENT_TRIGGER.md');
console.log('git commit -m "Trigger deployment - fix admin auth and URLs"');
console.log('git push');