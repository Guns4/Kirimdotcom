// Usage: node src/scripts/obfuscate.js "MY_SECRET_STRING"
const key = 'LIGUNS_SECURE_KEY_X99';
const text = process.argv[2];

if (!text) {
    console.log('Usage: node src/scripts/obfuscate.js "TEXT_TO_HIDE"');
    process.exit(1);
}

let result = '';
for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
}
console.log('Encrypted (Put this in your code):');
console.log(Buffer.from(result).toString('base64'));
