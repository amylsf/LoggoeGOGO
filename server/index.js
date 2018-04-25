const bodyParser = require('body-parser');
const express = require('express');
const moment = require('moment');
const axios = require('axios');
const {
  getOwnerTimestamp,
  getCurrentVideo,
  getOwnerVideos,
  getTimestamp, 
  getAllVideos, 
  getUserId,
  getUser, 
  setTimestamp, 
  setVideo, 
  setUser,
  getBuckets,
  deleteTimestamp,
  deleteVideo 
} = require('../database-mysql');

const searchYouTube = require ('youtube-search-api-with-axios');
const api = require('../config.js').API;

const app = express();

//---------------------------------------------------------MIDDLEWARE

app.use(express.static(__dirname + '/../react-client/dist'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//---------------------------------------------------------USER LOGIN

app.post('/login', (req, res) => {
  getUser(req.body.username, (err, response) => {
    (err) ? 
      res.status(403).send(err) :
      res.status(201).send(response);
  });
});

//---------------------------------------------------------USER REGISTRATION

app.post('/register', (req, res) => {
  getUser(req.body.username, (err, response) => {
    if (err) res.status(403).send(err);
    
    let isExist = !!response.length;

    if (isExist) {
      res.status(201).send(true);
    } 
    else {
      setUser(req.body, (err, response) => 
        (err) ? 
          res.status(403).send(err) :
          res.status(201).send(false)
      )      
    }

  })
})

//---------------------------------------------------------USER ID
//get userId for owner homepage and student homepage
app.get('/user/id', (req, res) => {
  getUserId(req.query.user, (userId) => 
    res.send(userId)
  )
})

//---------------------------------------------------------STUDENT USER REQUESTS
//get all videos for student homepage
app.get('/student/homepage', (req, res) => 
  getAllVideos((videos) => 
    res.send(videos)
  )
)

//---------------------------------------------------------OWNER USER REQUESTS

app.get('/owner/searchYoutube', (req, res) => {
  searchYouTube({key: api, q: req.query.query, maxResults: 10}, 
    (videos) => {
      res.status(200).send(videos);
    }
  )
})

// app.get('/owner/savedVideos', (req, res) => {
//   searchYouTube({key: api, q: req.query.query, maxResults: 1}, 
//     (video) => {
//       let url = `https://www.googleapis.com/youtube/v3/videos?id=${video[0].id.videoId}&part=contentDetails&key=${api}`;
//       //get duration
//       axios.get(url).then((data) => {
//         let duration = moment.duration(data.data.items[0].contentDetails.duration, moment.ISO_8601).asSeconds();
//         setVideo(video[0], req.query.userId, duration, () => {
//           getCurrentVideo(video[0].id.videoId, (video) => 
//             res.status(200).send(video)
//           )
//         })
//       });
//     });
// });

app.post('/owner/save', (req, res) => {
  let video = req.body.video;
  let userId = req.body.userId;
  console.log(video)
  let url = `https://www.googleapis.com/youtube/v3/videos?id=${video.id.videoId}&part=contentDetails&key=${api}`;
  axios.get(url)
  .then((data) => {
    let duration = moment.duration(data.data.items[0].contentDetails.duration, moment.ISO_8601).asSeconds();
    setVideo(video, userId, duration, () => {
      res.status(201).send('Saved to db');
    })
  })
})

app.post('/owner/delete', (req, res) => {
  let userId = req.body.userId;
  let videoId = req.body.video.videoId;
  deleteVideo(userId, videoId, () => {
    res.status(201).send('Removed from db');
  })
})

//get all videos for owner.
app.get('/owner/videoList', (req, res) => {
  getOwnerVideos(req.query.userId, (videos) => {
    res.send(videos);
  })
})

//---------------------------------------------------------ANALYTICS

app.get('/buckets', (req,res) => {
  const params = req.query
  getBuckets(params, (data) => {
    data.sort(function (a, b) {
      return Number(a.TimeStampGroup.match(/\d+/)) - Number(b.TimeStampGroup.match(/\d+/));
    });
    res.json(data)
  })
})

//---------------------------------------------------------WORKING WITH TIMESTAMPS

app.get('/timestamps', (req, res) => {
  let videoId = req.query.videoId
  getTimestamp(videoId, req.query.userId, (data) => {
    res.json(data);
  });  
})


app.get('/timestamps/owner', (req, res) => {
  let videoId = req.query.videoId
  getOwnerTimestamp(videoId, (data) => {res.send(data)});  
})

app.post('/timestamps', (req, res) => {
  let params = req.body.params;
  console.log(params)
  setTimestamp(params, (success) => {res.status(201).send()});
})

app.delete('/timestamps', (req, res) => {
  let params = req.query;
  deleteTimestamp(params, (success) => {res.send()})
})

//---------------------------------------------------------SERVER
let server = app.listen(3000, () => {
  console.log('listening on port 3000!');
});

//---------------------------------------------------------CHATROOM

const io = require('socket.io')(server);
let users = [];
let connections = [];

io.on('connection', (socket) => {
  connections.push(socket);
  console.log('Connected: %s sockets connected.', connections.length)

  socket.on('disconnect', (data) => {
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected.', connections.length)
  }) 

  socket.on('send message', (data) => {
    io.sockets.emit('new message', {msg: JSON.stringify(data)})
  })
});

//adds chat messages to the chats db
app.post('/chats', (req, res) => {

})