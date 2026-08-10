const https = require('https');
https.get('https://api.puter.com/v2/ai/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const models = JSON.parse(data);
      console.log(models.slice(0, 10)); // just to see structure
    } catch(e) { console.error("Parse error"); }
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
