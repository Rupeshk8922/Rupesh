import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');const validExtensions = [".js", ".jsx", ".ts", ".tsx"];

/**
 * Recursively walk directory and collect all files with valid extensions.
 */
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else if (validExtensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Extract import paths from file content using regex.
 */
function extractImports(fileContent) {
  const regex = /import\s+(?:.+?\s+from\s+)?["'](.+?)["']/g;
  const imports = [];
  let match;
  while ((match = regex.exec(fileContent))) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Create a simple React placeholder component file.
 */
function createPlaceholder(filePath) {
  const componentName = path.basename(filePath).replace(/\..+$/, "");
  const jsx = `
import React from 'react';

const ${componentName} = () => {
  return <div>${componentName} Placeholder</div>;
};

export default ${componentName};
`.trimStart();

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, jsx);
  console.log("✅ Created placeholder:", filePath);
}

/**
 * Resolve relative import path from current file.
 * Create placeholder file if import target doesn't exist.
 */
function resolveAndCreateMissing(importPath, currentFilePath) {
  // Only handle local relative imports (./ or ../ or /)
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    const baseDir = path.dirname(currentFilePath);

    // Resolve full path without extension first
    let fullPath = path.resolve(baseDir, importPath);

    // If import path points to a directory, look for index files
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      // Try index files with valid extensions
      const indexFile = validExtensions
        .map((ext) => path.join(fullPath, "index" + ext))
        .find(fs.existsSync);

      if (indexFile) return; // Found index file, no need to create

      // No index file found, create index.js placeholder
      createPlaceholder(path.join(fullPath, "index.js"));
      return;
    }

    // Check if file exists with or without extensions
    const existsDirectly = fs.existsSync(fullPath);
    const existsWithExt = validExtensions.some((ext) =>
      fs.existsSync(fullPath + ext)
    );

    if (!existsDirectly && !existsWithExt) {
      // Create placeholder with first valid extension (default to .js)
      const fileToCreate = fullPath + ".js";
      createPlaceholder(fileToCreate);
    }
  }
}

/**
 * Main runner: walk files, extract imports, create missing placeholders.
 */
function runFixer() {
  const files = walk(SRC_DIR);
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const imports = extractImports(content);
    imports.forEach((imp) => resolveAndCreateMissing(imp, file));
  });
  console.log("✅ All missing imports scanned and fixed (if possible).");
}

runFixer();
