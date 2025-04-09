const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for Google Sheets
app.get('/api/menu', async (req, res) => {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vThdwJCio195NrRM4K2PttTx6XFAp9fUod6nd0hIi_JbHwYqelwYAwlZUrMDvyNBgXXDLNclvzyk2ph/pubhtml');
        const text = await response.text();
        res.send(text);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send('Error fetching menu');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 