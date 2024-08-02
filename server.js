import typeDefs from './schemaGql.js';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {User, Quote, comparePass, createJWToken,  verifyJWToken } from './commonFun.js';
import { MONGO_URI, DB, port, gQl } from './config.js';
import resolvers from './resolvers.js'

const app = express();
app.use(express.json(), cors());
const httpServer = http.createServer(app);
httpServer.listen(port)
console.log(`🚀 GraphQL ready at http://localhost:4000/graphql`);

try {
    const options = {dbName: DB}
    await mongoose.connect(MONGO_URI,options);
} catch (error) {
    console.log(error);
}

mongoose.connection.on("connected", () => {
    console.log("🚀 connected to mongodb");
});

mongoose.connection.on("error", (err) => {
    console.log("error connecting", err);
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

const context = async ({req})=>{
    const { authorization } = req.headers;
    if(authorization){
     const userId  = await verifyJWToken(authorization)
     return userId
    }
}

app.use( gQl, expressMiddleware(server, {context}),);


// *****************Rest APIs**********************************************

app.post("/login", async (req, resp) => {
  if (!req.body.email ||  !req.body.password) {
       resp.status(400).send({ result:"Enter correct details"});
       return;
  }
  else{
         let user = await User.findOne({email:req.body.email})
         if(!user){
            resp.status(400).send({ result:"No User found"});
            return;
         }
         
         const doMatch = await comparePass(req.body.password,user.password)
         if(!doMatch){
             resp.status(400).send({ result:"email or password in invalid"})
             return;
         }

         const token = await createJWToken(user._id)
         resp.send({data:{"user":{token}}})
         return;
    }
});

//Testing api
app.post("/test", (req, resp) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return resp.status(400).send({ result: "No data found" });
  }else{
// Generate a random token by 6 digit values
const randomNumber = Math.floor(Math.random() * 900000) + 100000;
const concatenatedObject = { ...req.body, ...{value:randomNumber} };
resp.send(concatenatedObject);
  }
});

//This is for testing purpose
app.get('/', (req, res) => {
  res.send('Hello World!')
})