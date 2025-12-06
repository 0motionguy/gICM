#!/usr/bin/env node

import('../dist/index.js').catch((error) => {
  console.error('\n❌ Failed to load create-opus67:\n');

  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('  The package appears to be corrupted or incompletely installed.');
    console.error('  Try reinstalling: npm install -g create-opus67@latest\n');
  } else if (error.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
    console.error('  Module loading error. Try updating Node.js to v18 or later.\n');
  } else {
    console.error(`  ${error.message}\n`);
  }

  process.exit(1);
});
