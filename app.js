const express = require('express'),
      socket = require('socket.io');
      mongoose = require('mongoose'),
      bodyparser = require('body-parser'),
      fs = require('fs'),
      formidable = require('formidable'),
      sharp = require('sharp'),
      //cookieparser = require('cookie-parser'),
      session = require('express-session')(
          {
              secret: "my-secret",
              resave: true,
              saveUninitialized: true}
      ),
      sharedsession = require('express-socket.io-session'),
      ejs = require('ejs'),
      signup = require('./routes/signup');
      profilechange = require('./routes/profilechange');
const pointrankvalue = [0,20,50,100,200,350,550,800,1100,1450,2000,2400,2900,3500,4200,5000,6000];
const app = express(),
    server = app.listen(3000,()=> {
        console.log('connected to prt 3000 ');
    });
const io = require('socket.io')(server);

number = 1;
onlines = 0;
msgid=1000;
function namemaker()
{
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456987';
    let name = '' ;
    for(i=0;i<16;i++)
    {
        num = Math.random()*35;
        num = Math.floor(num);
        name+=letters.charAt(num);
    }
    return name;
}
mongoose.connect('mongodb://localhost/chatbook',{useNewUrlParser:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('umad!!');
});
const post = new mongoose.Schema({
    src : String,
    title : String,
    content : String,
    postimg : String,
    data : String
});
const user = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    name:String,
    gender:Number,
    age:Number,
    state:String,
    asl:String,
    bio:String,
    socketid:String,
    point:{type:Number,default:0},
    pointrank:{type:Number,default:0},
    rank:{type:Number,default:0},
    online:String,
    userimg:{type:Object,default:{avatar:1,src:1}},
    single:Number,
    blocks:Array,
    blocked:Array,
    punish:Array
});
const online = new mongoose.Schema({
    username:String,
    socketid:String,
    name:String,
    rank:Number,
    pointrank:Number,
    gender:Number,
    id:String,
    userimg:Object,
    punish:Array
});
const onlinemodel =mongoose.model('onlines',online);
const usermodel=mongoose.model("users",user);
const postmodel = mongoose.model('posts',post);
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyparser());
//app.use(cookieparser());
app.use(session);
app.use(function (req,res,next) {
    if(req.session.username)
    {
        res.locals.daniusername = req.session.username;
    }
    else
    {
        res.locals.daniusername = false;
    }
    next();
})
io.use(sharedsession(session));
    io.on('connection',(socket)=>{
        if(socket.handshake.session.userid) {
            console.log(socket.handshake.session.userid)
            usermodel.findById(socket.handshake.session.userid, '-password', function (err, doc) {
                console.log('doc ineh:=>' + doc)
                newonline = new onlinemodel({
                    username: doc.username,
                    pointrank: doc.pointrank,
                    id: doc._id,
                    gender: doc.gender,
                    rank: doc.rank,
                    name: doc.name,
                    socketid: socket.id,
                    userimg: doc.userimg,
                    punish: doc.punish
                });
                newuser = doc;
                newuser.socketid = socket.id
                socket.broadcast.emit('newuser', newuser);
                newonline.save(function (err, data) {
                    console.log(data);
                    onlineusers = onlinemodel.find(function (err, data) {
                        onlines++;
                        console.log('new socket:' + onlines);
                        socket.emit('showonlines', data);
                        number++;
                    });
                });
                socket.emit('me', doc);
                console.log(doc)
            });
            socket.on('disconnect', () => {
                onlines--;
                console.log('disconnect:' + onlines);
                io.emit('disconnectuser', socket.id);
                onlinemodel.deleteOne({socketid: socket.id}, function (err, data) {
                    console.log('deleted: ' + data)
                })
            });
            socket.on('msg', (data) => {
                if (data.activesocket !== 0) {
                    let newdata = data;
                    newdata.msgid = 'pv' + socket.id + msgid;
                    newdata.sendersocket = socket.id;
                    newdata.msg = newdata.msg.replace(/[<>]/g,' ');
                    msgid++;
                    io.to(data.activesocket).emit('msg', newdata);
                    console.log('msg sent');
                }
                else {
                    let newdata = data;
                    newdata.msgid = 'publicmsg' + socket.id + msgid;
                    newdata.sendersocket = socket.id;
                    newdata.msg = newdata.msg.replace(/[<>]/g,' ');
                    msgid++;
                    console.log('msg sent');
                    socket.broadcast.emit('msg', newdata);
                }

            });
            socket.on('imgmsg', (data) => {
                if (data.activesocket !== 0) {
                    newdata = data;
                    newdata.msgid = 'publicmsg' + socket.id + msgid;
                    newdata.sendersocket = socket.id;
                    console.log(newdata.sendersocket);
                    msgid++;
                    // bayad ye rah entekhab beshe ya 2 bar socket va ya yebar socket
                    io.to(data.activesocket).emit('imgmsg', newdata);
                    console.log('msg sent');
                }
                else {
                    newdata = data;
                    newdata.msgid = 'publicmsg' + socket.id + msgid;
                    newdata.sendersocket = socket.id;
                    console.log(newdata.sendersocket);
                    msgid++;
                    // bayad ye rah entekhab beshe ya 2 bar socket va ya yebar socke
                    console.log('msg sent');
                    socket.broadcast.emit('imgmsg', newdata);
                }
            });
            socket.on('incpoint', function () {
                usermodel.updateOne({_id: socket.handshake.session.userid}, {$inc: {point: 1}}, function () {
                    console.log('fsdfsdf');
                })
            })
            socket.on('pointrankinc', function () {
                usermodel.updateOne({_id: socket.handshake.session.userid}, {$inc: {point: 1}}, function () {
                    usermodel.findById(socket.handshake.session.userid, function (err, doc) {
                        if (doc.point - pointrankvalue[doc.pointrank + 1] >= 0) {
                            usermodel.updateOne({_id: socket.handshake.session.userid}, {$inc: {pointrank: 1}}, function () {
                                socket.emit('newrank');
                            })
                        }
                        else {
                            console.log('dsadasd')
                        }
                    })
                })
            })
            socket.on('askuserprofile', function (data) {
                usermodel.findOne({username: data}, function (err, doc) {
                    socket.emit('askuserprofile', doc);
                })
            })
            socket.on('blockuser',function (data) {
                io.to(data.socketid).emit('blockuser',{username:socket.handshake.session.username})
            })
            socket.on('unblockuser',function (data) {
                io.to(data.socketid).emit('unblockuser',{username:socket.handshake.session.username})
            })
            // police !!!
            socket.on('deletemsg',function (data,callback) {
                io.emit('deletemsguser',{id:data.id});
                callback('received');
                console.log('msgdeleted');
            })
            socket.on('punish',function (data) {
                console.log('punish')
                usermodel.findOne({username:data.username},function (err,doc) {
                    if(doc.rank === 0)
                    {
                        if (data.type === 1 || 2 || 3) {
                            let time = new Date();
                            time = time.getTime();
                            console.log(time)
                            usermodel.updateOne({username: data.username}, {
                                $push: {punish: {type: data.type, time: time}}
                            }, function (err) {
                                if (err) throw err;
                                socket.emit('punishdone')
                                io.to(data.socketid).emit('punishing', {
                                    police: socket.handshake.session.username,
                                    type: data.type
                                })
                            })
                        }
                        else if (data.type === 4)
                        {
                            usermodel.updateOne({username : data.username},{
                                $push : {punish : {type : 4,time : 'block'}}
                            },function (err) {
                                if (err) throw err;
                                socket.emit('punishdone');
                                io.to(data.socketid).emit('punishing', {
                                    police: socket.handshake.session.username,
                                    type: 4
                                })
                            })
                        }
                    }
                })
            });
        }
        else
        {
            socket.emit('login');// masmali
        }
    });


app.get('/',function (req,res) {
    res.render('home');
});
app.get('/chat',function (req,res) {
    if(req.session.username)
    {
        username = req.session.username;
        userid = req.session.userid;
        res.render('index',{username:username,userid:userid,rank:req.session.rank});
    }
    else res.render('login');
    });
app.get('/signup',function (req,res) {
    res.render('signup');
});
app.get('/login',function (req,res) {
   res.render('login',{err : false}) ;
});
app.post('/dosignup',function (req,res) {
    console.log('ok')
    const form = req.body;
    const check = signup.signup(form);
    if(check.statue === true){
        usermodel.findOne({username : form.username},function (err,data) {
            if (err) throw err;
            if(data === null) {
                const newuser = new usermodel({
                    username : form.username ,
                    name : form.name ,
                    password : form.password ,
                    gender : form.gender ,
                    age : form.age ,
                    state : form.state ,
                    email : check.email
                });
                newuser.save(function (err) {
                    if (err === null)
                    {
                        req.session.username = form.username;
                        res.render('signupimg',{gender : form.gender});
                    }
                });
            }else {
                res.redirect('/signup');
            }
        })
    } else {
        res.redirect('/signup');
    }
});
app.post('/checkusername',function (req,res) {
    const form = req.body;
    if(form.username){
        usermodel.findOne({username : form.username},function (err,data) {
            console.log('username cheked');
            if(data === null)
            {
                res.end('true');
            }else{
                res.end('false');
            }
        });
    }
    else{
        res.end('false')
    }
});
app.get('/profileimg',function (req,res) {
   if(req.session.username){
       usermodel.findOne({username : req.session.username},function (err,data) {
         if (err) throw err;
           res.render('signupimg',{gender : data.gender});
       })
   }
});
app.post('/useravatarsave',function (req,res) {
    if(req.session.username && req.body.avatar){
        const avatar = req.body.avatar;
        if (avatar>1 && avatar<37)
        {
            console.log('img resid');
            usermodel.updateOne({username:req.session.username},{userimg:{avatar:1,src:avatar}},function () {
                res.end('true');
            })
        }
        else
        {
            res.end('false')
        }
    }else {
        res.redirect('login');
    }
});
app.post('/dologin',function (req,res) {
    const form = req.body;
    if(form.username && form.password) {
        usermodel.findOne({username:form.username},function (err,doc) {
            if(doc===null)
            {
                res.render('login',{err : true});
            }else{
                if(form.password===doc.password && doc.punish.length === 0)
                {
                    req.session.username=doc.username;
                    req.session.userid=doc._id;
                    req.session.rank=doc.rank;
                    res.redirect('./chat');
                }else if(form.password!==doc.password){
                    res.render('login',{err : true});
                }
                else if (doc.punish[0].type !== 4)
                {
                    let time = new Date();
                    time = time.getTime();
                    time = time - doc.punish[0].time;
                    let stime =' ';
                    switch(doc.punish[0].type){ case 1: stime = 1000*60*10; break; case 2: stime = 1000*60*60*10; break; case 3: stime = 24*60*60*1000; break; case 4: stime = 'block' }
                    console.log(doc.punish[0].type)
                    if (stime === 'block')
                    {

                    }
                    else
                    {
                        if(time>stime)
                        {
                            usermodel.updateOne({username : form.username},{$pull : {punish:{}}},function (err) {
                                res.end('khali shode;')
                            })
                        }
                        else
                        {
                            res.render('punish',{time : stime - time})
                        }
                    }
                    console.log(time)
                }
                else if(doc.punish[0].type === 4)
                {
                    res.render('punish',{time : -1});
                }
            }
            })
    }else{
        res.render('login',{err : true});
    }
});
app.post('/chatimgupload',function (req,res) {
    if(req.session.username){
        let form = new formidable.IncomingForm();
        form.uploadDir='./public/landimg/';
        console.log(form);
        form.parse(req,function (err,fields,files) {
            console.log(files)
            if(files.chatimg && files.chatimg.size<2097152)
            {
                console.log(files.chatimg.type);
                oldpath = files.chatimg.path;
                newpath = '/chatimgs/'+namemaker() + '.' + files.chatimg.type.substring(6);
                fs.rename(oldpath,'./public'+newpath,function (err) {
                    res.end(newpath);
                    fs.unlink(oldpath,function () {
                        
                    })
                })
            }else{
                fs.readdir('./public/landimg',function (err,files) {
                    console.log(files)
                    for (const file of files)
                    {
                        fs.unlink('./public/imgland'+file,function () {
                            console.log('deleted')
                        })
                    }
                });
                res.end('error');
            }
        })
    }else {
        res.redirect('/login')
    }
});
app.post('/profilechange',function (req,res) {
    const form = req.body;
    if (req.session.username && form){
        const check = profilechange.check(form);
        if (check.statue === true){
            usermodel.updateOne({username : req.session.username},{
                bio : check.bio,
                asl : check.asl,
                single : form.single,
                age : form.age,
                state : form.state,
                name : form.name
            },function (err) {
                if(err) throw err;
                res.end('true');
            })
        } else {
            res.end('false');
        }
    }else
    {
        res.end('false');
    }
});
app.post('/passwordchange',function (req,res) {
    const form = req.body;
    if(req.session.username && form){
        if(form.password.length<3 || form.password.length>25){
            res.end('false');
        }else {
            usermodel.updateOne({username : username},{password : form.password},function (err) {
                if (err) throw err;
                res.end('true');
            });
        }
    } else {
        console.log(1)
        res.end('false');
    }
})
app.post('/blockuser',function (req,res) {
    form = req.body;
    usermodel.updateOne({username:req.session.username},{
        $push:{blocks:form.username}
    },function (err) {
        console.log('done1');
        usermodel.updateOne({username:form.username},{
            $push:{blocked:req.session.username}
        },function (err) {
            if (err) throw err;
            io.to(form.blocksocket).emit('blockuser',{username:req.session.username})
            console.log('done2');
            res.end('true')
        })
    })
})
app.post('/unblockuser',function (req,res) {
    form = req.body;
    usermodel.updateOne({username: req.session.username}, {$pull: {blocks: form.username}}, function (err) {
            if (err) throw  err
            usermodel.updateOne({username: form.username}, {$pull: {blocked: req.session.username}}, function (err) {
                if (err) throw err
                io.to(form.unblocksocket).emit('unblockuser',{username:req.session.username})
                res.end('ok')
        })
    })
})
app.post('/userprofileimgsetting',function (req,res) {
    if(req.session.username) {
        const form = req.body;
        let pos = req.body.pos;
        pos = Number(pos);
        usermodel.findOne({username:req.session.username},function (err,data) {
            if(data.userimg.avatar === 2)
            {
                if(form.dir==='w'){
                    sharp('./public/userimg/'+data.userimg.src).resize({height:256}).extract({width:256,height:256,top:0,left:pos}).toFile('./public/userimg/sharped'+data.userimg.src)
                        .then(function (data1) {
                            sharp('./public/userimg/sharped'+data.userimg.src).resize({height:64}).toFile('./public/tinyuserimg/tiny'+data.userimg.src)
                                .catch(function (err) {
                                    console.log(err);
                                }).then(function (data2) {
                                fs.unlink('./public/userimg/'+data.userimg.src,function (err) {
                                    if(err === null)
                                    {
                                        usermodel.updateOne({username : req.session.username},{userimg: {avatar : 0,src : data.userimg.src}},function (err) {

                                        })
                                    }
                                });
                                res.end('ok');
                            })
                        })
                        .catch(function (err) {
                            res.redirect('login');
                        })
                }else if (form.dir === 'h'){
                    sharp('./public/userimg/'+data.userimg.src).resize({width:256}).extract({width:256,height:256,top:pos,left:0}).toFile('./public/userimg/sharped'+data.userimg.src)
                        .then(function (data1) {
                            sharp('./public/userimg/sharped'+data.userimg.src).resize({height:64}).toFile('./public/tinyuserimg/tiny'+data.userimg.src)
                                .catch(function (err) {
                                    console.log(err);
                                }).then(function (data2) {
                                fs.unlink('./public/userimg/'+data.userimg.src,function (err) {
                                    if(err === null)
                                    {
                                        usermodel.updateOne({username : req.session.username},{userimg: {avatar : 0,src : data.userimg.src}},function (err) {

                                        })
                                    }
                                });
                                res.end('ok');
                            })
                        })
                        .catch(function (err) {
                            res.redirect('login');
                        })
                }
            }else{
                res.redirect('login');
            }
        })
    }else{
        res.redirect('login');
    }
});
app.post('/userimgupload',function (req,res) {
    if (req.session.username)
    {
        form = new formidable.IncomingForm();
        form.uploadDir = './public/userimgland/';
        form.parse(req,function (err,fields,files) {
            if(files.userimg) {
                usermodel.findOne({username : req.session.username},function (err,data) {
                   if (err) throw err;
                    const oldpath = files.userimg.path;
                    const newpath = './public/userimg/';
                    let newpath1 ;
                    console.log(data.userimg.src);
                    if(data.userimg.avatar === 0 || 2){
                        newpath1 = data.userimg.src ;
                    }else{
                        newpath1 = namemaker() + '.' + files.userimg.type.substring(6);
                    }

                    fs.rename(oldpath, newpath + newpath1, function (err) {
                        if (err) throw err
                        usermodel.updateOne({username: req.session.username}, {
                            userimg: {
                                avatar: 2,
                                src: newpath1
                            }
                        }, function (data) {
                            res.render('userimgsetting', {imgsrc: newpath1})
                        })
                    })
                });
            }
            else
            {
                res.redirect('login');
            }
        })
    }
    else
    {
        res.redirect('login')
    }
});
app.get('/img',function (req,res) {
    res.render('userimgsetting')
});
app.get('/blog',function (req,res) {
    res.render('blog');
});
app.get('/post/:postTitle',function (req,res) {
    postmodel.findOne({src : req.params.postTitle},function (err,doc) {
        if (err) throw err;
        if(doc !== null){
            res.render('post',{title : doc.title,content : doc.content ,img : doc.postimg})
        }
    })
})
app.get('/publishpost',function (req,res) {
    res.render('publishpost')
});
app.post('/publishpost',function (req,res) {
    console.log('save shod')
    const form = req.body;
    const src = form.title.replace(/\s/g,'-');
    const newpost = new postmodel({
        src : src,
        title : form.title,
        content : form.content,
        postimg : form.img
    }).save(function (err) {
        if(err === null){
            console.log('save shod')
        }
    });
    res.render('publishpost',{statue : 'save'})
})
function chatimgempty(){
    fs.readdir('./public/chatimgs',function (err,files) {
        for (const file of files)
        {
            fs.unlink('./public/chatimgs/'+file,function () {
                console.log('removed')
            })
        }
    });
}
const emptylandimg = setInterval(chatimgempty,300000);
onlinemodel.remove({},function () {
    console.log('removed')
});