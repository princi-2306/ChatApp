import app from './app.js';
import 'dotenv/config'
import connectDB from './db/index.js';

const port = process.env.PORT || 3000

connectDB().then(()=>{
   app.listen(port, (req, res) => {
      console.log(`Server running on port localhost:${port}`)
   })
}).catch((err) =>{
    console.log("MongoDB connection failed: " + err)
})

app.get("/", (req, res) => res.send(`Server running on port`));
