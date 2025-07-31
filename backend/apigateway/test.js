const express = require('express');
console.log('Testing basic express setup...');

const app = express();
app.get('/test', (req, res) => {
  res.json({ message: 'Express is working!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  process.exit(0); // Exit after starting successfully
});
