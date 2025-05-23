import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

function findAndReplaceImports(directory) {
    const files = readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            findAndReplaceImports(fullPath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
            let content = readFileSync(fullPath, 'utf8');
            let modified = false;

            // Regex to match named imports: import { a, b } from 'module';
            const importRegex = /import\s+{([^}]*)}\s+from\s+['"](.*?)['"];?/g;

            const unusedVars = findUnusedVars(content, fullPath);

            // We will rebuild content gradually to avoid index issues
            let newContent = '';
            let lastIndex = 0;
            let match;

            while ((match = importRegex.exec(content)) !== null) {
                const importedVarsString = match[1];
                const modulePath = match[2];

                // Split and trim imported vars
                const importedVars = importedVarsString.split(',').map(v => v.trim()).filter(Boolean);

                // Filter out unused vars
                const usedVars = importedVars.filter(v => !unusedVars.includes(v));

                // Construct new import line (or empty if none used)
                const newImportString = usedVars.length > 0 ? `{ ${usedVars.join(', ')} }` : '';
                const newImportLine = newImportString ? `import ${newImportString} from '${modulePath}';` : '';

                // Append unchanged content before this import statement
                newContent += content.slice(lastIndex, match.index);
                // Append the possibly modified import line
                newContent += newImportLine;

                lastIndex = match.index + match[0].length;

                if (newImportLine !== match[0]) {
                    modified = true;
                }
            }

            // Append remaining content after last import
            newContent += content.slice(lastIndex);

            if (modified) {
                writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated imports in: ${fullPath}`);
            }
        }
    });
}

// Your findUnusedVars function remains the same
function findUnusedVars(content, filePath) {
    const unused = [];
    // (Your long if blocks here)
    if (filePath.includes('src/App.jsx')) {
        unused.push('lazy', 'Suspense');
    }
    // ... all other file-specific unused variables ...
    return unused;
}
