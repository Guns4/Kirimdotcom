const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = './src';
const SQL_DIR = '.'; // Root for SQL files
const OUTPUT_FILE = './src/app/tech-docs/data.json';

// 1. Scan Project Structure
function scanDirectory(dir) {
    const results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            if (file === 'node_modules' || file === '.next' || file === '.git') return;
            results.push({
                type: 'folder',
                name: file,
                children: scanDirectory(filePath)
            });
        } else {
            // Simplified: Only listing meaningful extensions
            if (file.match(/\.(tsx|ts|sql)$/)) {
                results.push({
                    type: 'file',
                    name: file,
                    size: stat.size
                });
            }
        }
    });
    return results;
}

// 2. Generate ERD from SQL Files (Heuristic Regex)
function generateERD() {
    let mermaid = 'erDiagram\n';
    const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql'));

    const tables = new Set();
    const relationships = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(SQL_DIR, file), 'utf8');

        // Find Table Definitions
        const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi);

        for (const match of tableMatches) {
            const tableName = match[1];
            tables.add(tableName);
            mermaid += `    ${tableName} {\n`;
            mermaid += `        uuid id PK\n`;
            mermaid += `        timestamp created_at\n`;
            mermaid += `    }\n`;
        }

        // Find References (Foreign Keys) for Relationships
        const refMatches = content.matchAll(/(\w+_id) .*REFERENCES (?:public\.|auth\.)?(\w+)/gi);
        for (const match of refMatches) {
            const foreignKey = match[1];
            const referencedTable = match[2];
            relationships.push({ foreignKey, referencedTable });
        }
    });

    // Add some core relationships if detected
    if (tables.has('users') && tables.has('transactions')) {
        mermaid += `    users ||--o{ transactions : "has"\n`;
    }
    if (tables.has('users') && tables.has('subscriptions')) {
        mermaid += `    users ||--o{ subscriptions : "subscribes"\n`;
    }
    if (tables.has('users') && tables.has('api_keys')) {
        mermaid += `    users ||--o{ api_keys : "owns"\n`;
    }
    if (tables.has('users') && tables.has('wallets')) {
        mermaid += `    users ||--|| wallets : "has"\n`;
    }
    if (tables.has('users') && tables.has('point_history')) {
        mermaid += `    users ||--o{ point_history : "earns"\n`;
    }
    if (tables.has('feature_requests') && tables.has('feature_votes')) {
        mermaid += `    feature_requests ||--o{ feature_votes : "receives"\n`;
    }

    return mermaid;
}

// Execute
console.log('Scanning Project Structure...');
const structure = scanDirectory(SRC_DIR);

console.log('Generating ERD...');
const erd = generateERD();

const data = {
    timestamp: new Date().toISOString(),
    structure,
    erd
};

// Ensure dir exists
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
console.log(`✓ Documentation data saved to ${OUTPUT_FILE}`);
console.log(`✓ Generated ERD for ${erd.split('erDiagram')[1].split('{').length - 1} tables`);
