import express from 'express';

import routes from './routes/index.js';
const app = express();

const port = 3001;

app.get('/', (req, res) => {
    res.send('IPFS upload server is up and running!');
});

 // Mount endpoints
 app.use('/api/v1', routes)

app.listen(port, () => console.log('Server ready at: http://localhost:%s', port))
