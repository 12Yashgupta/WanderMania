const express = require("express");
const router = express.Router();
const Message = require("../models/message");

router.get("/chat/:roomId/:user", async (req, res) => {
  const roomId = req.params.roomId;
  const user = req.params.user;
 // console.log(user)
 // console.log("In chat/user route")
  const messages = await Message.find({ roomId });
 console.log(messages.length) 
  res.render("listings/chat", { roomId, messages, username: user });
});
router.post("/save-message", async (req, res) => {
    const { roomId, sender, message } = req.body;
  //  console.log(roomId,sender,messages)
    console.log(req.user.username);
    await Message.create({ roomId, sender, message });
    res.sendStatus(200);
  });
router.get("/chat/request/:sender/:reciever",async(req,res)=>{

  let sender = req.params.sender;
  let reciever = req.params.reciever;
  
  const roomIds = [`${sender}+${reciever}`, `${reciever}+${sender}`];
  const messages = await Message.findOne({
    roomId: { $in: roomIds }
  });
console.log(messages)
 if(messages){
   return res.redirect(`/chat/${messages.roomId}/${sender}`)
 }
 // let sender = req.params.sender;
 // let reciever = req.params.reciever;
  //console.log(sender,reciever)
  
 // let all_chats = await Message.find({});
  
    
  let new_room_id =  sender+'+'+reciever;
  console.log(new_room_id)
return  res.redirect(`/chat/${new_room_id}/${sender}`)
})
router.get("/chat/see_chats",async(req,res)=>{
  const current_user =  req.user.username;
//  console.log(current_user)
  const all_data =  await Message.find({})
  let new_array = []
  for (let data of all_data) {
    let users_sender_reciever = data.roomId.split('+')
    let friends = []
    if(users_sender_reciever[0]==current_user )
    {
           friends.push(users_sender_reciever[1])
           friends.push(data.roomId)
       //    if (!new_array.includes(friends)) {
            new_array.push(friends)
         // }
    }
    else  if(users_sender_reciever[1]==current_user )
      {
             friends.push(users_sender_reciever[0])
             friends.push(data.roomId)
        //     if (!new_array.includes(friends)) {
              new_array.push(friends)
        //  }
      }
 
   // console.log(friends)
  }
let uniqueMatrix = [];

let seen = new Set();

  for (let row of new_array) {
    let rowStr = JSON.stringify(row);
    if (!seen.has(rowStr)) {
      seen.add(rowStr);
      uniqueMatrix.push(row);
    }
  }
//console.log(uniqueMatrix)
res.render("users/chat.ejs",{uniqueMatrix})
})
  module.exports = router;
