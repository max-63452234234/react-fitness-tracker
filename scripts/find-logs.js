#!/usr/bin/env node

/**
 * Script to find all logging statements in JavaScript/JSX files
 * Checks for console.log, console.error, console.warn, console.info, console.debug
 * 
 * Usage: 
 *   node scripts/find-logs.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// RegExp patterns for different types of logging
const LOG_PATTERNS = [
  /console\.log\(/g,
  /console\.error\(/g,
  /console\.warn\(/g,
  /console\.info\(/g,
  /console\.debug\(/g,
  /console\.trace\(/g,
  /console\.dir\(/g,
  /console\.group\(/g,
  /console\.groupEnd\(/g,
  /console\.time\(/g,
  /console\.timeEnd\(/g,
  /console\.count\(/g,
  /console\.assert\(/g
];

// Count how many logs we found
let totalLogsFound = 0;

// Files to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  'build',
  '.git',
  'scripts'
];

// File extensions to check
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Process a file to find logging statements
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let fileLogsFound = 0;
    
    // Check each line for logging patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      for (const pattern of LOG_PATTERNS) {
        if (pattern.test(line)) {
          if (fileLogsFound === 0) {
            console.log(`\n\x1b[1m${filePath}\x1b[0m`);
          }
          
          // Find the type of log
          let logType = 'log';
          if (line.includes('console.error')) logType = 'error';
          else if (line.includes('console.warn')) logType = 'warn';
          else if (line.includes('console.info')) logType = 'info';
          else if (line.includes('console.debug')) logType = 'debug';
          else if (line.includes('console.trace')) logType = 'trace';
          else if (line.includes('console.dir')) logType = 'dir';
          else if (line.includes('console.group')) logType = 'group';
          else if (line.includes('console.groupEnd')) logType = 'groupEnd';
          else if (line.includes('console.time')) logType = 'time';
          else if (line.includes('console.timeEnd')) logType = 'timeEnd';
          else if (line.includes('console.count')) logType = 'count';
          else if (line.includes('console.assert')) logType = 'assert';
          
          // Get the log color
          let color = '\x1b[32m'; // green for log
          if (logType === 'error') color = '\x1b[31m'; // red
          else if (logType === 'warn') color = '\x1b[33m'; // yellow
          else if (logType === 'info') color = '\x1b[36m'; // cyan
          
          console.log(`  Line ${lineNumber}: ${color}console.${logType}\x1b[0m: ${line.trim()}`);
          fileLogsFound++;
          totalLogsFound++;
          break; // Only count each line once, even if multiple log statements
        }
      }
    }
    
    return fileLogsFound;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return 0;
  }
}

/**
 * Walks a directory recursively to find all JS files
 * @param {string} dirPath - Directory to scan
 */
function walkDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (EXCLUDE_DIRS.includes(entry.name)) continue;
        
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        
        if (FILE_EXTENSIONS.includes(ext)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
}

// Start the scan
console.log('Scanning for logging statements...');
const startTime = Date.now();

// Start from project root (where the script is run from)
const projectRoot = path.resolve('.');
walkDir(projectRoot);

const endTime = Date.now();
const duration = (endTime - startTime) / 1000; // in seconds

console.log('\n--------------------------------');
console.log(`Found ${totalLogsFound} logging statements in ${duration.toFixed(2)} seconds`);
console.log('--------------------------------');

// Exit with error if logs found, useful for CI
process.exit(totalLogsFound > 0 ? 1 : 0);
