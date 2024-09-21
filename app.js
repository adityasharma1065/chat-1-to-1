const express=require("express")
const app=express()
const path=require("path")
const {v4:uuidv4}=require("uuid")

const http =require("http")
const server=http.createServer(app)
const socketIo=require("socket.io")
const io=socketIo(server)


var waitinguser=[];
var users={};

io.on("connection",(socket)=>{
    console.log("connected");
    
        socket.on("disconnect",()=>{
            delete users[socket.id];
            io.emit("members",users)
        })    
        
        socket.on("joinroom",(val)=>{
            
            users[socket.id]=val;
            console.log(users);
            
            // io.emit("members",users)
            
            if(waitinguser.length==0){
                waitinguser.push(socket);
                
                return;
            }
            
            
            const roomid=uuidv4();
         
         
          

            const previoususer=waitinguser.pop();
            const currentuser=socket;

            previoususer.join(roomid)
            currentuser.join(roomid)
            
            // console.log(val);
            

            io.to(roomid).emit("joinedroom",{roomid,name:val})
            // io.to(roomid).emit("members",users)
            io.to(roomid).emit("members",users)
         
    })

    socket.on("message",(val)=>{
        socket.to(val.room).emit("message",{message:val.inp,name:users[socket.id]})
    })
})

app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get("/",(req,res)=>{
    res.render("index")
})

server.listen(3000)