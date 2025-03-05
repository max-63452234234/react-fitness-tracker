# Fitness Tracker Scripts

This directory contains utility scripts for managing the Fitness Tracker application.

## Log Management Scripts

### Finding Console Log Statements

The `find-logs.js` script scans your codebase to find all console logging statements (log, error, warn, etc.).

```bash
# Run from the project root
node scripts/find-logs.js
```

Features:
- Detects all console.* methods (log, error, warn, info, debug, etc.)
- Displays line numbers and content
- Color-coded output by log type
- Excludes node_modules, build directories, and script files
- Reports total number of logging statements found
- Exit code 1 if logs found (useful for CI/CD)

### Removing Console Log Statements

The `remove-logs.js` script can automatically remove or comment out console logging statements.

```bash
# Run from the project root - dry run to see what would be changed
node scripts/remove-logs.js --dry-run

# Comment out logging statements instead of removing them
node scripts/remove-logs.js --comment

# Remove all logging statements
node scripts/remove-logs.js
```

Features:
- Can either remove or comment out log statements
- Dry run mode to preview changes
- Detailed reporting of what was changed
- Safely handles multi-line and complex log statements
- Excludes node_modules, build directories, and script files

## Use Cases

1. **Pre-Production Cleanup**:
   ```bash
   # Find all logs first
   node scripts/find-logs.js
   
   # Review and then remove them
   node scripts/remove-logs.js
   ```

2. **Continuous Integration**:
   Add to your CI pipeline to prevent logging statements from being committed:
   ```bash
   node scripts/find-logs.js
   # If exit code is 1, fail the build
   ```

3. **Temporarily Comment Logs**:
   ```bash
   node scripts/remove-logs.js --comment
   # Logs are now commented out, can be uncommented later for debugging
   ```

## Adding to package.json Scripts

You can add these to your package.json scripts for easier access:

```json
"scripts": {
  "find-logs": "node scripts/find-logs.js",
  "remove-logs": "node scripts/remove-logs.js",
  "comment-logs": "node scripts/remove-logs.js --comment",
  "prepare-prod": "node scripts/remove-logs.js && npm run build"
}
