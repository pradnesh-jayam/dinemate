// Build script to inject environment variables into config.js
const fs = require('fs');
const path = require('path');

const configContent = `// Auto-generated config.js - DO NOT EDIT
window.DINEMATE_SUPABASE_URL = "${process.env.DINEMATE_SUPABASE_URL || ''}";
window.DINEMATE_SUPABASE_ANON_KEY = "${process.env.DINEMATE_SUPABASE_ANON_KEY || ''}";
`;

const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent);
console.log('✅ config.js generated with environment variables');
