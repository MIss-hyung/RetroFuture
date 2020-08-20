const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

fs.readdir('uploads', (error) => {
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      nick: req.body.nick,
      img: req.body.url,
      price: req.body.price,
      userId: req.user.id,
      account: req.body.account,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() },
      })));
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: {title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }
    
        return res.render('list', {
            title: 'Travlog',
            twits: posts,
            user: req.user,
            loginError: req.flash('loginError'),
        });
       

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id }});
    await post.addLiker(req.user.id);
    res.send('OK');
    conn.query('INSERT INTO posts(likeCount) SELECT count(*) FROM Like WHERE postId=?'
        ,[req.params.postId],(err,rs)=>{
    if(err){
        console.log(err);
        res.end();
    }else{
        res.render(':id/like');
    }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id }});
    await post.removeLiker(req.user.id);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;