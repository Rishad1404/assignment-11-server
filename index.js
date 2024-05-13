const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
require('dotenv').config()
const port=process.env.PORT||5000;

// MiddleWare
const corsOptions={
    origin:['http://localhost:5173','http://localhost:5177',],
    credentials:true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

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
    const submittedCollection=client.db('studyMate').collection('submit')

    // JWT token
    app.post('/jwt',async(req,res)=>{
        const user=req.body
        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:'7d'
        })
        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:'none'
        })
        res.send({success:true});
    })
    app.post('/logout',async(req,res)=>{
         const user=req.body;
         console.log('logging out',user);
         res.clearCookie('token',{maxAge:0}).send({success:true})
    })


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

    // Save submitted Assignment
    app.post('/submit',async(req,res)=>{
        const submitData=req.body;
        const result=await submittedCollection.insertOne(submitData)
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

    // Get assignment by Specific User
    app.get('/submitAssignment/:email',async(req,res)=>{
        const email=req.params.email
        const query={email:email}
        const result=await submittedCollection.find(query).toArray()
        res.send(result)
    })
    
    // Update Assignment
    app.get('/singleAssignment/:id',async(req,res)=>{
        console.log(req.params.id)
        const result=await assignmentCollection.findOne({_id:new ObjectId(req.params.id)})
        res.send(result)
      })


    app.put('/updateAssignment/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(req.params.id)}
        const assignment={
          $set:{
            title:req.body.title,
            description:req.body.description,
            thumbnail:req.body.thumbnail,
            mark:req.body.mark,
            difficulty:req.body.difficulty,
            due:req.body.due
          }
        }
        const result=await assignmentCollection.updateOne(query,assignment)
        console.log(result)
        res.send(result)
      })
    
    // Update Saved Assignment
    app.put('/confirmed/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const updatedData={
            $set:{
                status:req.body.status,
                givenMark:req.body.givenMark,
                feedback:req.body.feedback
            }
        }
        const result=await submittedCollection.updateOne(query,updatedData)
        console.log(result)
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