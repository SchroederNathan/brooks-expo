// tools/harvest carries its own node_modules (Playwright). Keep Metro's
// crawler out of it; the app never imports from tools/.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const toolsDir = path.join(__dirname, 'tools').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = new RegExp(`^${toolsDir}/.*$`);

module.exports = config;
