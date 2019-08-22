function socketmanager()
{
    io.on('connection',(socket)=>{
        onlines++;
        users.push({username:number,name:number,socketid:socket.id});
        console.log('new socket:'+onlines);
        socket.emit('showonlines',users);
        socket.broadcast.emit('newuser',{username:number,name:number,socketid:socket.id});
        number++;
        socket.on('disconnect',()=>{
            onlines--;
            const usernum = users.findIndex(v => v.socketid==socket.id);
            console.log(usernum);
            console.log(usernum);
            console.log('disconnect:'+onlines);
            io.emit('disconnectuser',users[usernum].username);
            users.splice(usernum,1);
        });
        socket.on('msg',(data)=>
        {
            if(data.activesocket!==0)
            {
                userstatue = users.find(user => user.socketid === socket.id);
                console.log('user found');
                newdata = data ;
                newdata.msgid='publicmsg'+socket.id+msgid;
                newdata.sendersocket = socket.id;
                console.log(newdata.sendersocket);
                msgid++;
                // bayad ye rah entekhab beshe ya 2 bar socket va ya yebar socket
                io.to(data.activesocket).emit('msg',newdata);
                console.log('msg sent');
            }
            else
            {
                newdata = data ;
                newdata.msgid='publicmsg'+socket.id+msgid;
                newdata.sendersocket = socket.id;
                console.log(newdata.sendersocket);
                msgid++;
                // bayad ye rah entekhab beshe ya 2 bar socket va ya yebar socke
                console.log('msg sent');
                socket.broadcast.emit('msg',newdata);
            }

        });
    });
}
module.exports.socketmanager = socketmanager();