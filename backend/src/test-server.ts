import express from 'express';
const app = express();
app.listen(5001, () => console.log('Simple server on 5001'));
setInterval(() => console.log('Ping'), 5000);
