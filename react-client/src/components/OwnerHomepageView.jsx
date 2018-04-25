import {withRouter} from 'react-router-dom';
import React from 'react';
import axios from 'axios';

import Hidden from './owner-homepage-view/Hidden.jsx';
import SearchList from './owner-homepage-view/SearchList.jsx';
import VideoList from './owner-homepage-view/VideoList.jsx';
import Search from './owner-homepage-view/Search.jsx';
import OwnerVideo from './OwnerVideoView.jsx';
import Paper from 'material-ui/Paper';

class OwnerHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      video: '',
      userId: '',
      searchedVideos: []
    }
    this.getUserId = this.getUserId.bind(this);
    this.showVideoList = this.showVideoList.bind(this);
    this.sendToSelectedVideo = this.sendToSelectedVideo.bind(this);
    this.getYouTubeVideos = this.getYouTubeVideos.bind(this);
    this.saveVideo = this.saveVideo.bind(this);
    this.deleteVideo = this.deleteVideo.bind(this);
  }

  componentDidMount() {
    this.getUserId(this.props.location.username);
  }
  
  getUserId(user) {
    axios.get('/user/id', {params: {user: user}})
         .then((data) => {
           this.setState({userId: data.data[0].id}, ()=> this.showVideoList());
         })
  }

  showVideoList() {
    axios.get('/owner/videoList', {params: {userId: this.state.userId}})
          .then(({data}) => {this.setState({videos: data})})
  }

  sendToSelectedVideo(video) {
    this.props.history.push({
        pathname: '/owner/video',
        video: video, 
        userId: this.state.userId
      })
  }

  getYouTubeVideos(query) {
    axios.get('/owner/searchYouTube', {params: {query: query}})
    .then(({data}) => {
      console.log('client side', data)
      this.setState({
        searchedVideos: data
      })
    })
  }

  saveVideo(video) {
    axios.post('/owner/save', {video: video, userId: this.state.userId})
    .then(() => {
      console.log('Video saved.');
      this.showVideoList();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  deleteVideo(video) {
    axios.post('/owner/delete', {video: video, userId: this.state.userId})
    .then(() => {
      console.log('Video deleted');
      this.showVideoList();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  render () {
    return (
      <Paper style={style} zDepth={1}>
      <div id="owner-homepage-app">
        <header className="navbar"><h1>Hello {this.props.location.username}</h1></header>
        <div className="main">
          <Search getVideos={this.getYouTubeVideos}/>
          <div>
          {this.state.searchedVideos.length === 0 ? <div style={hidden}></div> : <SearchList videos={this.state.searchedVideos} save={this.saveVideo} redirect={this.sendToSelectedVideo}/>}
          <Hidden deleteVideo={this.deleteVideo}/>
          <VideoList 
            userId={this.state.userId}
            videos={this.state.videos} 
            redirect={this.sendToSelectedVideo}
            deleteVideo={this.deleteVideo}
            save={this.saveVideo}
          />
          </div>
        </div>  
      </div>   
      </Paper>
    )
  }
}

const style = {
  height: '100vh',
  width: 'auto',
  margin: '30px',
  textAlign: 'center',
  display: 'block',
  padding: '30px',
  background: '#D8E4EA'
}

const hidden = {
  height: '70vh',
  float: 'left',
  width: '40%'
}

export default withRouter(OwnerHomepage)