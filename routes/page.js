const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

// 프로필 내가쓴 글 보기
router.get('/profile', isLoggedIn, (req, res) => {
  Post.findAll({
    include: [{
        model: User,
        attributes: ['id', 'nick'],
    },{
      //좋아요누른사람들
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  })
  .then((posts) => {
      res.render('profile', {
          title: 'Travlog',
          twits: posts,
          user: req.user,
          loginError: req.flash('loginError'),
      });
  });
});

router.get('/follow', isLoggedIn, (req, res) => {
  Post.findAll({
    include: [{
        model: User,
        attributes: ['id', 'nick'],
    },{
      //좋아요누른사람들
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  })
  .then((posts) => {
      res.render('follow', {
          title: 'Travlog',
          twits: posts,
          user: req.user,
          loginError: req.flash('loginError'),
      });
  });
});
router.get('/scheduleHotel', isLoggedIn, (req, res) => {
  res.render('scheduleHotel', {
    title: 'Schedule - Hotel',
    user: req.user,
    loginError: req.flash('loginError'),
  });
});

router.get('/schedule', isLoggedIn, (req, res) => {
  res.render('schedule', {
    title: 'Schedule',
    user: req.user,
    loginError: req.flash('loginError'),
  });
});

router.get('/schedule', isLoggedIn, (req, res) => {
  res.render('schedule', {
    title: 'Schedule',
    user: req.user,
    loginError: req.flash('loginError'),
  });
});

router.get('/login', isNotLoggedIn, (req, res) => {
  res.render('login', {
    title: 'LogIn',
    user: req.user,
    loginError: req.flash('loginError'),
  });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join');
});



router.get('/', (req, res, next) => {
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
      order: [['hit', 'DESC']],
  })
  .then((posts) => {
    console.log(posts);
      res.render('index', {
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

router.get('/checkpassword', isLoggedIn, (req, res) => {
  res.render('checkpassword', {
    title: '비밀번호 확인',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});


module.exports = router;