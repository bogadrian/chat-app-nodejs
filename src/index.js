const path = require('path');
const express = require('express');

console.log('Testing ssh connection')

const app = express();

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.listen(port, () => {
    console.log(' Sever is up and runnning on port: ' + port)
})
