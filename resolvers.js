import {User, Quote, comparePass, createJWToken, hashThePassword } from './commonFun.js';


const resolvers = {
    Query:{
        users:async () => await User.find({}),
        user:async (_,{_id})=> await User.findOne({_id}),
        quotes:async ()=>await Quote.find({}).populate("by","_id firstName"),
        iquote:async (_,{by})=> await Quote.find({by}),
        myprofile:async (_,args,{userId})=>{
            if(!userId) throw new Error("You must be logged in")
            return await User.findOne({_id:userId})
           }
     },
    User:{
         quotes:async (ur)=> await Quote.find({by:ur._id})
     },
    Mutation:{
        signupUser:async (_,{userNew})=>{
          const user = await User.findOne({email:userNew.email})
          if(user){
              throw new Error("User already exists with that email")
          }
         const hashedPassword =  await hashThePassword(userNew.password)

        const newUser =  new User({
             ...userNew,
             password:hashedPassword
         })
        return await newUser.save()
        },
        signinUser:async (_,{userSignin})=>{
         const user = await User.findOne({email:userSignin.email})
         if(!user){
             throw new Error("User dosent exists with that email")
         }
         const doMatch =  await comparePass(userSignin.password,user.password)
         if(!doMatch){
             throw new Error("email or password in invalid")
         }
         const token = await createJWToken(user._id)
         return {token}
        },
        createQuote:async (_,{name},{userId})=>{
           if(!userId) throw new Error("You must be logged in")
           const newQuote = new Quote({
               name,
               by:userId
           })
           await newQuote.save()
           return "Quote saved successfully"
        }
    }
}

export default resolvers