const express = require('express')
const Multer  = require('multer')
const {Storage} = require('@google-cloud/storage');
require("dotenv").config()
const app = express()
const storage = new Storage({projectId:process.env.GCLOUD_PROJECT,credentials:{client_email:process.env.CLIENT_EMAIL,private_key:process.env.PRIVATE_KEY}})

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits:{
        fileSize:9*1024*1024*1024
    }
})

app.post("/api/imageUpload",multer.single("file"), async(req,res)=>{
    console.log(req.file)
    const bucket =storage.bucket(process.env.GCS_BUCKET);
    const blob= bucket.file(req.file.originalname)
    const blobStream = blob.createWriteStream({
        resumable: false,
        validation: false
      })
    blobStream.on("error",err=>console.log(err))

    blobStream.on("finish", async ()=>{
        const publishUrl = format(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`)
        const imageDetails = JSON.parse(JSON.stringify(req.file))
        console.log(imageDetails);
        res.send("Uploaded"+publishUrl)
    })
    blobStream.end(req.file.buffer)
    
})

app.listen(3000,()=>{
    console.log("server at 3000");
})