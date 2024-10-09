import fs from 'fs';

console.log("Incrementing version");

// Read the package.json file
fs.readFile('package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }

    // Parse the JSON data
    const packageJson = JSON.parse(data);

    // Split the version string into an array
    const versionParts = packageJson.version.split('.');

    // Increment the last number
    versionParts[versionParts.length - 1] = parseInt(versionParts[versionParts.length - 1]) + 1;

    // Join the parts back into a version string
    packageJson.version = versionParts.join('.');

    // Write the updated package.json back to the file
    fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), (err) => {
        if (err) {
            console.error('Error writing package.json:', err);
            return;
        }
        console.log('Version updated to:', packageJson.version);
    });
});
