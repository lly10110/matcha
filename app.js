const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const crypto = require('crypto');
const ejs = require('ejs');
const axios = require('axios');

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION };

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    // Render your main HTML file
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/process', async (req, res) => {

    let { bubbleTea, toppings } = req.body;
    if (typeof bubbleTea === 'string') {
        bubbleTea = [bubbleTea];
    }
    if (typeof toppings === 'string') {
        toppings = [toppings];
    }
    const id = createUserID(bubbleTea + toppings);
    const data = [];
    
    const options = {
        method: 'GET',
        url: 'https://numbersapi.p.rapidapi.com/6/21/date',
        params: {
          fragment: 'true',
          json: 'true'
        },
        headers: {
          'X-RapidAPI-Key': '24c0482f43msh213f9a9e2b54becp1bcb0cjsnfb32becf2afe',
          'X-RapidAPI-Host': 'numbersapi.p.rapidapi.com'
        }
      }
    try {
        for (let i = 0; i < 3; i++) {
            const response = await axios.request(options);
            const tea = getRandomTea(bubbleTea);
            const topping = getRandomToppings(toppings);
            data.push({ id: id, tea: tea, toppings: topping, fact: response.data.text });
            
        }
        await postData(data);

            // Save the data to MongoDB
    

        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="css/style.css">
            <title>Form Submission Confirmation</title>
        </head>
        <body>
            <h1>what you want</h1>
            
            <p>Thank you for submitting the form. The following information was sent:</p>
            
            <ul>
                <li>Bubble Tea: ${bubbleTea}</li>
                <li>Toppings: ${toppings} </li>
            </ul>
            
            <form action="/match" method="post">
                <input type="hidden" name="id" value="${id}">
                <button type="submit">View your matches!</button>
            </form>
        </body>
        </html>`);
    } catch (error) {
        console.error(error);
    }


}); 

app.post('/match', async (req, res) => {
    // Get data from MongoDB
    const data = await getData(req.body.id);
    console.log(data.length);

    // Render the match page
    res.render(__dirname + '/public/match.ejs', { data: data });
    // Delete data from MongoDB
    await deleteData(req.body.id);
});

app.get('/delete', async (req, res) => {
    // Delete all data from MongoDB
    await deleteAllData();
    res.send('All data deleted');
});

// Add more routes as needed

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});


// post data to mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
async function postData(data) {
    
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        console.log('Connected to MongoDB: Posting Data');
        for (let i = 0; i < data.length; i++) {
            const { id, tea, toppings, fact } = data[i];
            const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne({ id: id, bubbleTea: tea, toppings: toppings, fact: fact });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// view data from mongodb
async function getData(id) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        console.log('Connected to MongoDB: Getting Data');
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({id: id}).toArray();
        console.log(result);
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// delete data from mongodb
async function deleteData(id) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({ id: id });
        console.log(result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
// delete all data from mongodb
async function deleteAllData() {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
        console.log(result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
function createUserID(inputString) {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}

function getRandomTea(teas) {
    if (teas.length <= 1) {
        teas = ['Black Tea', 'Green Tea', 'Oolong Tea', 'Earl Grey', 'Jasmine Tea', 'Thai Tea', 'Matcha'];
    }
    return teas[Math.floor(Math.random() * teas.length)];
}

function getRandomToppings(toppings) {
    let new_toppings = toppings;
    if (toppings.length <= 1) {
        new_toppings = ['Boba', 'Jelly', 'Pudding', 'Grass Jelly', 'Red Bean'];
    }
    let randomToppings = [];
    const numToppings = Math.floor(Math.random() * new_toppings.length) + 1;
    for (let i = 0; i < numToppings; i++) {
        const randomIndex = Math.floor(Math.random() * new_toppings.length);
        randomToppings.push(new_toppings[randomIndex]);
    }
    return randomToppings;
}

