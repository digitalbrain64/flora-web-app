const express= require('express');

const path = require('path');

const rootDir = require('../utils/path');

const router = express.Router();
router.get('/pass-change-step-1', (req, res, get)=>{
    res.render('pass-change-step-1');
})
router.get('/pass-change-step-2', (req, res, get)=>{
    res.render('pass-change-step-2');
})
router.get('/pass-change-step-3', (req, res, get)=>{
    res.render('pass-change-step-3');
})
router.get('/login', (req,res,next)=>{
    res.render('login-page');
});
router.post('/dashboard', (req, res, next)=>{
    console.log(req.body);
    res.render('dashboard');
});

module.exports = router;