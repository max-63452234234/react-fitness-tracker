#!/usr/bin/env node

/**
 * Script to remove or comment out console logging statements in JavaScript/JSX files
 * 
 * Usage: 
 *   node scripts/remove-logs.js [--comment] [--dry-run]
 * 
 * Options:
 *   --comment     Comment out log statements instead of removing them
 *   --dry-run     Don't modify files, just show what would be changed
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const COMMENT_LOGS = args.includes('--comment');
const DRY_RUN = args.includes('--dry-run');

// RegExp patterns for different types of logging
const LOG_PATTERNS = [
  { pattern: /console\.log\(.*?\);?/g, type: 'log' },
  { pattern: /console\.error\(.*?\);?/g, type: 'error' },
  { pattern: /console\.warn\(.*?\);?/g, type: 'warn' },
  { pattern: /console\.info\(.*?\);?/g, type: 'info' },
  { pattern: /console\.debug\(.*?\);?/g, type: 'debug' },
  { pattern: /console\.trace\(.*?\);?/g, type: 'trace' },
  { pattern: /console\.dir\(.*?\);?/g, type: 'dir' },
  { pattern: /console\.group\(.*?\);?/g, type: 'group' },
  { pattern: /console\.groupEnd\(.*?\);?/g, type: 'groupEnd' },
  { pattern: /console\.time\(.*?\);?/g, type: 'time' },
  { pattern: /console\.timeEnd\(.*?\);?/g, type: 'timeEnd' },
  { pattern: /console\.count\(.*?\);?/g, type: 'count' },
  { pattern: /console\.assert\(.*?\);?/g, type: 'assert' }
];

// Stats for reporting
let totalFilesScanned = 0;
let totalFilesModified = 0;
let totalLogsFound = 0;
let totalLogsRemoved = 0;

// Files and directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  'build',
  '.git',
  'scripts'
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Process a file to remove/comment logging statements
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let fileLogsFound = 0;
    let fileLogsModified = 0;
    
    // Apply each pattern to find and modify logs
    for (const { pattern, type } of LOG_PATTERNS) {
      // Reset the lastIndex for the regex
      pattern.lastIndex = 0;
      
      // Find all matches in the content
      const matches = [...modifiedContent.matchAll(pattern)];
      
      if (matches.length > 0) {
        fileLogsFound += matches.length;
        totalLogsFound += matches.length;
        
        // Only proceed with modifications if matches were found
        if (COMMENT_LOGS) {
          // Comment out log statements
          modifiedContent = modifiedContent.replace(pattern, (match) => {
            fileLogsModified++;
            totalLogsRemoved++;
            return `// ${match}`;
          });
        } else {
          // Remove log statements
          modifiedContent = modifiedContent.replace(pattern, () => {
            fileLogsModified++;
            totalLogsRemoved++;
            return '';
          });
        }
      }
    }
    
    // Output info about what was found
    if (fileLogsFound > 0) {
      console.log(`\n\x1b[1m${filePath}\x1b[0m`);
      console.log(`  Found: ${fileLogsFound} logging statements`);
      
      if (DRY_RUN) {
        console.log(`  Dry run: Would ${COMMENT_LOGS ? 'comment out' : 'remove'} ${fileLogsModified} statements`);
      } else {
        console.log(`  ${COMMENT_LOGS ? 'Commented out' : 'Removed'}: ${fileLogsModified} statements`);
      }
    }
    
    // Update the file if there were changes
    if (fileLogsModified > 0 && !DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      totalFilesModified++;
    }
    
    totalFilesScanned++;
    return { found: fileLogsFound, modified: fileLogsModified };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return { found: 0, modified: 0 };
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

// Start the process
console.log(`${DRY_RUN ? 'Dry run: ' : ''}Scanning for logging statements to ${COMMENT_LOGS ? 'comment out' : 'remove'}...`);
const startTime = Date.now();

// Start from project root (where the script is run from)
const projectRoot = path.resolve('.');
walkDir(projectRoot);

const endTime = Date.now();
const duration = (endTime - startTime) / 1000; // in seconds

console.log('\n--------------------------------');
console.log(`Scanned ${totalFilesScanned} files in ${duration.toFixed(2)} seconds`);
console.log(`Found ${totalLogsFound} logging statements`);

if (DRY_RUN) {
  console.log(`Dry run: Would ${COMMENT_LOGS ? 'comment out' : 'remove'} ${totalLogsRemoved} statements`);
} else {
  console.log(`${COMMENT_LOGS ? 'Commented out' : 'Removed'} ${totalLogsRemoved} statements in ${totalFilesModified} files`);
}
console.log('--------------------------------');

// Exit with info about how many logs were found/removed
process.exit(0);
