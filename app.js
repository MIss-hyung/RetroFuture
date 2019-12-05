const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const router = express.Router();
require('dotenv').config();

const { User, Post } = require('./models');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('./routes/middlewares');

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

const bodyParser = require('body-parser');
const mysql = require('mysql2');
// mysql
const conn = mysql.createConnection({
    "user": "root",
    "password": "20161139",
    "database": "retrofuture",
    "host": "127.0.0.1",
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use(bodyParser.urlencoded({extended : true}));

// 라우터 미들웨어

    // 입력 요청
      // 리스트 요청

         // 상세내용 보기
    router.get('/postsDetail', isLoggedIn, (req,res)=>{  
        console.log('/postsDetail 요청');
        if(!req.query.id){
            res.redirect('postsList');
        }
        else{conn.query('UPDATE posts SET hit=hit+1 WHERE id=?'        
                        ,[parseInt(req.query.id)]);
            conn.query('SELECT id,title,img,content,nick,updatedAt,price,account FROM posts WHERE id=?'
                    ,[parseInt(req.query.id)],(err,rs)=>{
                if(err){
                    console.log(err);
                    res.end();
                }else{
                    res.render('postsDetail',{
                        postsDetail:rs[0],
                        user: req.user,
                        joinError: req.flash('joinErrer'),
                    });
                }
            });
        }
    });

router.get('/postsList', isLoggedIn, (req,res)=>{
    console.log('/postsList 요청');

    Post.findAll({
        //작성자
            include: [{
                model: User,
                attributes: ['id', 'nick'],
            },{
            //좋아요누른사람들
            model: User,
            attributes: ['id', 'nick'],
            as: 'Liker',
            }],
            order: [['id', 'DESC']],
        })
        .then((posts) => {
        console.log(posts);
            res.render('postsList', {
                title: 'Travlog',
                twits: posts,
                user: req.user,
                loginError: req.flash('loginError'),
            });
        })
        .catch((error) => {
            console.error(error);
            next(error);
        });
});

        // 삭제 요청
    // 글 삭제 폼
    router.get('/deletePosts',(req,res)=>{
        console.log('/deletePosts 삭제 요청');
        const id = parseInt(req.query.id);
        console.log(id);
        res.render('deletePosts',{
            deletePosts:id,
            user: req.user,
            joinError: req.flash('joinErrer'),
        });
    });
    // 글 삭제 액션
    router.post('/deletePosts',(req,res)=>{
        console.log('/deletePosts 삭제 처리');
        const id = req.body.id;
        // const posts_pw = req.body.posts_pw;
        conn.query('SELECT nick FROM posts WHERE id=?'
            ,[id],(err,rs)=>{
                if(err){
                    console.log(err);
                    res.end();
                }else{
                    const nick = rs[0].nick;
                    if(nick == req.user.nick){
                        conn.query('DELETE FROM posts WHERE id =?'
                                ,[id],(err,rs)=>{
                            if(err){
                                console.log(err);
                                res.end();
                            }else{
                                res.redirect('postsList');
                            }
                        });
                    }else{
                        res.status(403).send('삭제 권한 없음');
                    }
                }
            });
    });

    // 글 입력 폼
    router.get('/addPosts', isLoggedIn, (req,res)=>{
        console.log('/addPosts 입력폼 요청');
        res.render('addPosts', {
            user: req.user,
            joinError: req.flash('joinErrer'),
        });
    });
    // 글 입력 액션
    router.post('/addPosts', (req,res)=>{
        console.log('/addPosts 입력액션 요청');
        const title = req.body.title;
        const price = req.body.price;
        const content = req.body.content;
        const updatedAt = req.body.updatedAt;
        const nick = req.body.nick;
        const account = req.body.account;
 
        conn.query('INSERT INTO posts(title,content,nick,price,account,updatedAt) VALUES(?,?,?,?,?,now())'
                ,[title, content, nick, price, account], (err, result)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.redirect('postsList');
            }
        });   
    });
    app.use('/',router);
// 미들웨어 설정 끝
// 80번포트 웹서버 실행
app.listen(80, function () {
    console.log('Example app listening on port 80!');
});

        // 수정 요청
    // 글 수정 폼
    router.get('/updatePosts', isLoggedIn, (req,res)=>{
        console.log('/updatePosts 수정폼 요청');
        const id = parseInt(req.query.id);
        conn.query('SELECT id,title,content,price FROM posts WHERE id=?'
                ,[id],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('updatePosts',{
                    updatePosts:rs[0],
                    user: req.user,
                    joinError: req.flash('joinErrer'),
                });
            }
        });
    });
    // 글 수정 액션
    router.post('/updatePosts',(req,res)=>{
        console.log('/updatePosts 수정액션 요청');
        const id = req.body.id;
        const title = req.body.title;
        const content = req.body.content;
        const price = req.body.price;
        conn.query('SELECT nick FROM posts WHERE id=?'
            ,[id],(err,rs)=>{
                if(err){
                    console.log(err);
                    res.end();
                }else{
                    const nick = rs[0].nick;
                    if(nick == req.user.nick){
                        conn.query('UPDATE posts SET title=?,content=?,price=? WHERE id=?'
                                ,[title, content, price, id],(err,rs)=>{
                            if(err){
                                console.log(err);
                                res.end();
                            }else{
                                res.redirect('postsList');
                            }
                        });
                    }else{
                        res.status(403).send('수정 권한 없음');
                    }
                }
            });
    });

    //회원수정 폼
    router.get('/edituser', isLoggedIn, (req,res)=>{
        console.log('/edituser 수정폼 요청');
        const id = parseInt(req.query.id);
        console.log(id);
        conn.query('SELECT email, nick FROM users WHERE id = ?'
                ,[id],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('edituser',{
                    edituser: rs[0],
                    user: req.user,
                    joinError: req.flash('joinError'),
                });
            }
        });
    });

    //회원수정 액션
    router.post('/edituser',async (req, res, next) => {
        const id = req.user.id;
        const email = req.body.email;
        const nick = req.body.nick;
        const password = req.body.password;
        const last_nick = req.user.nick;
        try {
            const exUser = await User.findOne({ where: {email} });
            if(exUser){
                const hash = await bcrypt.hash(password, 12);
                conn.query('UPDATE users SET email=?, nick=?, password=? WHERE id=?'
                        ,[email, nick, hash, id], (err,rs)=>{
                            if(err){
                                console.log(err);
                                res.end();
                            }else{
                                if(last_nick != nick){
                                    conn.query('UPDATE posts SET nick=? WHERE nick=?'
                                            ,[nick, last_nick], (err,rs) => {
                                                if(err){
                                                    console.log(err);
                                                    res.end();
                                                } else {
                                                    res.redirect('profile');
                                                }
                                            });
                                }
                            }
                        });
            }
        }catch (error) {
            console.error(error);
            return next(error);
        }
    });

    // 스크랩 폼
    router.get('/scrapPosts', isLoggedIn, (req,res)=>{
        console.log('/scrapPosts 스크랩폼 요청');
        const id = parseInt(req.query.id);
        console.log(id);
        conn.query('SELECT id,title,content,img,hit,nick,price FROM posts WHERE id=?'
                ,[id],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('scrapPosts',{
                    scrapPosts:rs[0],
                    user: req.user,
                    joinError: req.flash('joinErrer'),
                });
            }
        });
    });

    // 스크랩액션
    router.post('/scrapPosts',(req,res)=>{
        console.log('/scrapPosts 스크랩액션 요청');
        const postId = req.body.id;
       // const free_pw = req.body.free_pw;
        const title = req.body.title;
        const nick = req.body.nick;
        const hit = req.body.hit;
        const userId = req.user.id;
        const img = req.body.img;
        const price = req.body.price;
        conn.query('INSERT INTO scraps(postId, userId, title, nick, hit, img, price) VALUES(?,?,?,?,?,?,?)'
                ,[postId,userId,title,nick,hit,img,price],(err,rs)=>{
                    if(err){
                        console.log(err);
                        res.end();
                    }else{
                        res.redirect('scrapsList');
            
                    }
                });
    });

    router.get('/scrapsList', isLoggedIn, (req,res)=>{
        console.log('/scrapsList 요청');
        let rowPerPage = 10;    // 페이지당 보여줄 글목록 : 10개
        let currentPage = 1; 
        const userId = req.user.id;   
        if(req.query.currentPage){    
            currentPage = parseInt(req.query.currentPage);  
        }
        let beginRow =(currentPage-1)*rowPerPage;   
        console.log(`currentPage : ${currentPage}`);
        let model = {};
        conn.query('SELECT COUNT(*) AS cnt FROM scraps where userId=?',[userId],(err,result)=>{  //전체 글목록 행 갯수 구하기
            if(err){
                console.log(err);
                res.end();
            }else{
                console.log(`totalRow : ${result[0].cnt}`);
                let totalRow = result[0].cnt;
                lastPage = totalRow / rowPerPage;   
                if(totalRow % rowPerPage != 0){ 
                    lastPage++;
                }
            }
            conn.query('SELECT id, postId, title, nick, hit, img, price FROM scraps where userId= ? ORDER BY updatedAt ASC LIMIT ?,?'
                    ,[userId, beginRow,rowPerPage],(err,rs)=>{   
                if(err){   
                    console.log(err);
                    res.end();
                }
                else{
                    model.postsList = rs;
                    model.currentPage = currentPage;
                    model.lastPage = lastPage;
                    res.render('scrapsList',{
                        model: model,
                        user: req.user,
                        loginError: req.flash('loginErrer'),
                    });
                }
            });
        });
    });

    
    module.exports = router;

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});

