const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");
const validExtensions = [".js", ".jsx", ".ts", ".tsx"];

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

function extractImports(fileContent) {
  const regex = /import\s+(?:.+\s+from\s+)?["'](.+)["']/g;
  const imports = [];
  let match;
  while ((match = regex.exec(fileContent))) {
    imports.push(match[1]);
  }
  return imports;
}

function createPlaceholder(filePath) {
  const componentName = path.basename(filePath).replace(/\..+$/, "");
  const ext = path.extname(filePath);
  const isTS = ext === ".tsx" || ext === ".ts";
  const jsx = `
import React from 'react';

const ${componentName} = () => {
  return <div>${componentName} Placeholder</div>;
};

export default ${componentName};
`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, jsx.trimStart());
  console.log("✅ Created:", filePath);
}

function resolveAndCreateMissing(importPath, currentFilePath) {
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    const base = path.dirname(currentFilePath);
    let fullPath = path.resolve(base, importPath);

    const possibilities = validExtensions.map((ext) => fullPath + ext);
    if (!fs.existsSync(fullPath) && !possibilities.some(fs.existsSync)) {
      const fileToCreate = possibilities[0]; // create with .js
      createPlaceholder(fileToCreate);
    }
  }
}

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