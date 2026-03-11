
const fs = require('fs');
const https = require('https');
const path = require('path');

const url = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
const dest = path.join(__dirname, '../client/public/bg-field.jpg');

const file = fs.createWriteStream(dest);

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode}`);
    return;
  }
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download completed: bg-field.jpg');
    });
  });
}).on('error', (err) => {
  fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
  console.error(`Error: ${err.message}`);
});
