const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    cb(null, uuidv4() + '.mp3'); // Use the original file name as the saved file name
  }
});
const upload = multer({ storage: storage });

require('dotenv').config();

router.post('/', function (req, res, next) {
  let data = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are an education assistant for teenager students. Try to be fun and helpful." +
          "Students will provide you with an explanation of a topic. You should identify errors in their explanation and provide a correct explanation." +
          "You should also be able to answer questions about the topic." +
          "When a student is wrong you should provide some memory techiniques to help them remember the correct information." +
          "For example, base yourself on the following techniques: acronyms, visualization, association, and rhymes." +
          "You must create the acronyms or rhymes yourself, not only propose their use" +
          "The topic is: World War 1."
      },
      {
        "role": "user",
        "content": "World War 1 was a conflict that lasted from 1916 to 1918 and involved many countries."
      }
    ]
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post('/audio', upload.single('file'), function (req, res, next) {
  if (!req.file) {
    return res.status(400).json
  }

  let data = new FormData();
  data.append('file', fs.createReadStream(req.file.path));
  data.append('model', 'whisper-1');

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/audio/transcriptions',
    headers: {
      'Authorization': `Bearer ${process.env.OPEN_AI_APIKEY}`,
      ...data.getHeaders()
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
