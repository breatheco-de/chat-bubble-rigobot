import fs from 'fs';

// Get the target argument
const target = process.argv[2] === '--target' ? process.argv[3] : null;

if (!target || (target !== 'prod' && target !== 'dev')) {
    console.error('Please specify a valid target: --target prod or --target dev');
    process.exit(1);
}

const fileToRead = target === 'prod' ? 'prodIndex.html' : 'devIndex.html';
console.log(`Updating index.html with content from ${fileToRead}`);

// Read the content of the specified file
fs.readFile(fileToRead, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading ${fileToRead}:`, err);
        return;
    }

    // Write the content to index.html
    fs.writeFile('index.html', data, (err) => {
        if (err) {
            console.error('Error writing to index.html:', err);
            return;
        }
        console.log(`index.html has been updated with the content from ${fileToRead}`);
    });
});
