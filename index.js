const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

const dotenv = require('dotenv')
dotenv.config()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello, frontend, I am come from backend!');
})


// mongodb doc code 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db('wanderlust');
        const allPlacesList = database.collection('places');
        const bookingCollection = database.collection('bookings');
        // for all places get and post method
        app.get('/destination', async(req, res) => {
            const places = await allPlacesList.find();
            const destinations = await places.toArray();
            res.send(destinations);
        })
        app.post('/destination', async(req, res) => {
            const destinationData = req.body
            const result = await allPlacesList.insertOne(destinationData)
            res.json(result)
        })
        
        // now see a single place details, edit and delete
        app.get('/destination/:id', async(req, res) => {
            const id = req.params; //.id;
            const query = {
                _id: new ObjectId(id)
            }
            const place = await allPlacesList.findOne(query);
            res.send(place);
        })
        app.patch('/destination/:id', async(req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const modifiedValue = req.body;
            const result = await allPlacesList.updateOne(query, {$set: modifiedValue});
            // const editedDestination = {
            //     $set: {
            //         destinationName: modifiedValue.destinationName,
            //         country: modifiedValue.country,
            //         category: modifiedValue.category,
            //         price: modifiedValue.price,
            //         imageUrl: modifiedValue.imageUrl,
            //         departureDate: modifiedValue.departureDate,
            //         description: modifiedValue.description,
            //         duration: modifiedValue.duration
            //     }
            // }
            // const result = await allPlacesList.updateOne(query, editedDestination);
            res.send(result);
        })
        app.delete('/destination/:id', async(req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await allPlacesList.deleteOne(query);
            res.send(result);
        })

        // booking get, post and delete method api
        app.get('/booking/:userId', async(req, res) => {
            const { userId } = req.params;
            const bookingData = await bookingCollection.find({ userId: userId });
            const bookings = await bookingData.toArray();
            res.send(bookings);
        })
        app.post('/booking', async(req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData);
            res.json(result);
        })
        app.delete('/booking/:id', async(req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            // there is two way to do delete
            //const result  = await bookingCollection.deleteOne(query);
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
            res.json(result);
        })

        await client.connect();
        await client.db('places in wanderlust').command({ ping: 1});
        console.log('Pinged your deployment. Your successfully connected to MongoDB!');
    
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})