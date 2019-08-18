const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const app = express();

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, 'public');
const utilsPath = path.join(__dirname, 'utils');
const viewsPath = path.join(__dirname,'templates' ,'views');
const partialsPath = path.join(__dirname,'templates' ,'partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);


const userRoutes = require('./routes/user');
//const adminRoutes = require('./routes/admin');


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(publicPath));
app.use(express.static(utilsPath));
// route to home page
app.get('/', (req, res, next)=>{
    res.render('index');
});

app.use(userRoutes);
//app.use('/admin',adminRoutes);

// route to 404 page
app.use('*', (red,res,next)=>{
    res.status(404).render('404page');

})





app.listen(port, ()=>{
    console.log(`server is listening on port ${port}!`);
});
