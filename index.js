const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
require('dotenv').config()
const port=process.env.PORT||5000;

// MiddleWare
const corsOptions={
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials:true,
    optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(express.json())

// 5r7IH2uphKnJw06D
// studyMate


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.he8foru.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    const assignmentCollection=client.db('studyMate').collection('assignments')

    // Post assignments
    app.post('/assignments',async(req,res)=>{
        console.log(req.body)
        const result=await assignmentCollection.insertOne(req.body)
        console.log(result)
        res.send(result)
    })
    app.get('/assignments',async(req,res)=>{
        const cursor=assignmentCollection.find()
        const result=await cursor.toArray();
        res.send(result)
    })


    // Get assignments by email
    app.get('/myAssignment/:email',async(req,res)=>{
        console.log(req.params.email)
        const result=await assignmentCollection.find({email:req.params.email}).toArray()
        res.send(result)
    })

    // Delete a assignment
    app.delete('/myAssignments/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await assignmentCollection.deleteOne(query)
        res.send(result)
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send('StudyMate Server is running')
})
app.listen(port,()=>{
    console.log(`StudyMate Server is running on port ${port}`);
} )