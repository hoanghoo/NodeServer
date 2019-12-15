const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()

// to log request from client
app.use(logger('dev'))

// to access parameters from clients (ex: req.body...)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// to public 'uploads' folder
app.use(express.static(path.join(__dirname, 'uploads')))


//
app.get('/', function(req, res, next) {
  res.send("Welcome to Photo API")
})

// upload file to server
const multer  = require('multer')
const mkdirp = require('mkdirp')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = 'uploads';
    mkdirp.sync(dest);
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mbs
  }
})
app.post('/api/upload', upload.single('file'), (req, res, next) => {
  if (req.file.path) {
    res.send({
      success: true,
      message: 'Successfully upload file to server!',
      data: {
        filepath: req.file.path.substring(8) // cut "uploads/"
      }
    })
  } else {
    res.send({
      success: false,
      message: 'Failed to upload file to server!'
    })
  }
})

// get all files
const fs = require('fs')
app.get('/api/images', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    var data = []
    files.forEach(filepath => {
      data.push({'filepath': filepath})
    })
    if (err != null) {
      res.send({
        error: err.message
      })
    } else {
      res.send({
        data: data
      })
    }
  })
})

// delete file
app.delete('/api/image', (req, res) => {
  const filepath = req.body.filepath
  
  if (!filepath) {
    return res.send({
      success: false,
      message: 'Failed to delete file on server!',
      error: {
        name: "BadRequestError",
        message: "Missing filepath parameter!"
      }
    })
  }
  fs.unlink('uploads/' + filepath, (err) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Failed to delete file on server!',
        error: err
      })
    }
    return res.send({
      success: true,
      message: 'Successfully delete file on server!',
    })
  })

})


app.listen(8128)