const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())
// app.use(express.static("public"));
//


// mongodb data  [change this data]
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kc8fcbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const userCollection = client.db('techDB').collection('users')
        const productCollection = client.db('techDB').collection('products')
        
        // jwt token api making related
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            // console.log("the token is ",token);
            res.send({ token })
        })
        // middleware
        const verifyToken = (req, res, next) => {
            console.log("inserted token", req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Unauthorized access' })
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Unauthorized access' })
                }
                req.decoded = decoded;
                next()
            })
        }
    

       //for users
        app.post('/users', async (req, res) => {
            const users = req.body;
            const {email, name} = users;
            console.log(users);
            const existingUser = await userCollection.findOne({ email });
            if (existingUser) {
                res.status(409).send({message: 'user already exist'})
                return;
            }
            const result = await userCollection.insertOne(users);
            res.send(result)
        })

        //for products
        app.get('/products',async(req,res)=>{
            try {
                const products = await productCollection.find().toArray();
                res.send(products)
            } catch (error) {
                res.status(500).send({ message: 'Error fetching products', error });
            }
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('the server is running........')
})
app.listen(port, () => {
    console.log(`the server: ${port}`);
})
