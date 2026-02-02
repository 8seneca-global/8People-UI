const fs = require('fs');
const https = require('https');
const path = require('path');

const inputFilePath = path.join(__dirname, 'images.json');
const outputDir = path.join(__dirname, 'downloaded_images');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Read the JSON file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading images.json:', err);
        return;
    }

    try {
        const imageUrls = JSON.parse(data);

        imageUrls.forEach((url, index) => {
            // Extract filename from URL (using component_id or just index)
            const urlObj = new URL(url);
            const componentId = urlObj.searchParams.get('component_id') || `image_${index}`;
            const ext = 'png'; // Defaulting to png as they are from Adobe CC sharing
            const fileName = `${componentId}.${ext}`;
            const filePath = path.join(outputDir, fileName);

            console.log(`Downloading: ${url} -> ${fileName}`);

            const file = fs.createWriteStream(filePath);
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    console.error(`Failed to download ${fileName}: Status ${response.statusCode}`);
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Finished: ${fileName}`);
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => { }); // Delete the file if error occurs
                console.error(`Error downloading ${fileName}:`, err.message);
            });
        });
    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});
