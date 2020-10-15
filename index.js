const app = require('express')();
require('dotenv').config();
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const classRoutes = require('./routes/class');
const deckRoutes = require('./routes/deck');
const cardRoutes = require('./routes/card');
const passport = require('passport');
require('./config/passport.js')();


// define log directory
const logDirectory = path.join(__dirname, 'log');

// ensure directory exists
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);


// create rotating file stream
// will rotate to a new log when the current one reaches 10 mb
let logStream = rfs.createStream("http_requests.log", {
    size: "10M",
    compress: true,
    path: logDirectory
});

// setup database connection for mongoose
mongoose.set("debug", false);
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true
});

// setup logger
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logStream }));
}

//setup passport
app.use(passport.initialize());

// setup body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set up routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/class", classRoutes);
app.use("/api/deck", deckRoutes);
app.use("/api/card", cardRoutes);

app.get("/", (req, res, next) => {
    res.send("<h1>hello there</h1>")
})


// middleware gets called anytime a request comes in that doesn't match one of the prevoius routes
app.use((req, res, next) => {
    let err = new Error("Could not find matching route");
    err.number = 404;

    next(err);
})

// default error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(err.message);
})

const server = app.listen(8080, () => {
    console.log("The server is listening")
})

module.exports = server;