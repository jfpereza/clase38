import express from "express";
import session from "express-session";
import passport from "passport";
import LocalStrategy from 'passport-local';
import mongoose from "mongoose";
import Users from './modelMongo.js';
import routes from './routersConfigDB.js';
import { fork } from "child_process";

const app = express()
app.use(express.urlencoded({ extended: true }))

passport.use('login', new LocalStrategy(
    (username, password, done) => {
        Users.findOne({ username }, (err, user) => {
            if (err) return done(err)
            if (!user) console.log('User not found ')
            return done(null, user)
        })
    }
))
passport.use('signup', new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
        console.log('signup...')
        Users.findOne({ username }, (err, user) => {
            if (err) return done(err)
            if (user) {
                console.log('User already exists')
                return done(null, false)
            }
            const newUser = { username, password, name: req.body.name }
            Users.create(newUser, (err, userWithID) => {
                if (err) return done(err)
                console.log(userWithID)
                return done(null, userWithID)
            })
        })
    }
))
passport.serializeUser((user, done) => {
    done(null, user._id)
})
passport.deserializeUser((id, done) => {
    Users.findById(id, done)
})
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 30000,
        secure: false,
        httpOnly: true
    }
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', routes.getRoot)
app.get('/login', routes.getLogin)
app.post('/login',
    passport.authenticate('login'),
    routes.postLogin
)
app.get('/signup', routes.getSignup)
app.post('/signup', passport.authenticate
    ('signup', { failureRedirect: '/failsignup' }),
    routes.postSignup
)
app.get('/failsignup', routes.getFailsignup)
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) next()
    else res.redirect('/login')
}
app.get('/private', checkAuthentication, (req, res) => {
    const { user } = req
    res.send('<h1> 🚀 logueado.. 🚀 </h1>')
})
// ----------------ramdon------------------------------//
app.get('/', (req, res) => {
    info = process.pid
    console.log(info);
    res.json(`info ${info}`)
})
app.get('/ram', (req, res) => {
    ram = process.pid
    console.log(ram);
    res.json(`ram ${ram}`)
})

//----------------------------------------------------------//
function connectDB(url, cb) {
    mongoose.connect(url,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        err => {
            if (!err) console.log('Connected DB!')
            if (cb != null) cb(err)
        }
    )
}
// -----------------------mongoDB--------------------------//
connectDB('mongodb://localhost:27017/CODERHOUSE', err => {
    if (err) return console.log('Error connecting DB', err)
    app.listen(process.env.port || 8081, () => {
        console.log('Listening server...8081');
    })
})






// app.post('/api/random', (req, res) => {
//     const cant = req.query.cant || 2000000000;
//     const result = {}
//     for (let i = 0; i < cant; i++) {
//         let numero = Math.random() * 1000
//         if (numero in result) result[numero]++
//         else result[numero] = 1
//     }
//     res.send(`<h3>calculate ${result}</h3>`);

//     if (err) return console.log('error ramdon', err);
// })
