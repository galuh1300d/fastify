const fastify = require('fastify')({
  logger: true
})
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const keys = require('./config/keys')
const cors = require('cors')
const session = require('express-session')
const expressValidator = require('express-validator')
const fileUpload = require('express-fileupload')
const passport = require('passport')
require('./models/Saran')

mongoose.connect(keys.mongoURI)

fastify.use(cors())
fastify.use(bodyParser.urlencoded({ extended: false }))
fastify.use(bodyParser.json())

fastify.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
//   cookie: { secure: true }
}))

fastify.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
              , root = namespace.shift()
              , formParam = root;

      while (namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      };
  },
  customValidators: {
      isImage: (value, filename) => {
          var extension = (path.extname(filename)).toLowerCase();
          switch (extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case '.png':
                  return '.png';
              case '':
                  return '.jpg';
              default:
                  return false;
          }
      }
  }
}))

fastify.use(require('connect-flash')())

require('./config/passport')(passport)
fastify.use(passport.initialize())
fastify.use(passport.session())

// require('./routes/adminHalamanRoutes')(fastify)
require('./routes/halamanRoutes')(fastify)
require('./routes/userRoutes')(fastify)
require('./routes/saranRoutes')(fastify)

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    await fastify.listen(PORT)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()