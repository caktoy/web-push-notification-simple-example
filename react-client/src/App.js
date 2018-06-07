import React, { Component } from 'react';
import socketIO from 'socket.io-client';
import Push from 'push.js';
// import moment from 'moment';

import logo from './logo.svg';
import './App.css';

import PostCard from './PostCard';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: '',
      to: '',
      comment: '',
      comments: [],
      users: [],
      username: '',
      // posts: [
      //   {
      //     id: 'post-0',
      //     user: 'thony',
      //     content: 'This is the 1st post',
      //     comments: []
      //   },
      //   {
      //     id: 'post-1',
      //     user: 'hermawan',
      //     content: 'This is the 2nd post',
      //     comments: []
      //   },
      //   {
      //     id: 'post-2',
      //     user: 'caktoy',
      //     content: 'This is the 3rd post',
      //     comments: []
      //   },
      // ],
    }

    // this.onChangeUsername = this.onChangeUsername.bind(this);

    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.onBlurTo = this.onBlurTo.bind(this);
    this.onChangeComment = this.onChangeComment.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.socket = socketIO('http://localhost:3030', { transports: ['websocket'] });
    this.socket.on('subscribed', (data) => {
      console.log(data);
      this.setState({ users: data });
    });
    this.socket.on('comment received', data => {
      console.log(data);

      this.setState(state => {
        state.comments.push(data);
        return {
          comments: state.comments
        }
      });

      if (data.from !== this.state.from) {
        Push.create(`${data.from} post a comment`, {
          body: data.comment,
          timeout: 3000,
          icon: logo,
        });
      }
    });
  }

  // onChangeUsername(e) {
  //   this.setState({ username: e.target.value });
  // }

  onChangeFrom(e) {
    this.setState({ from: e.target.value });
  }

  onChangeTo(e) {
    this.setState({ to: e.target.value });
  }

  onBlurTo(e) {
    if (e.target.value !== '') {
      this.socket.emit('subscribe', {
        post_id: 'web_push'
      });
    }
  }

  onChangeComment(e) {
    this.setState({ comment: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    this.socket.emit('post comment', {
      from: this.state.from, 
      to: this.state.to,
      comment: this.state.comment,
      post_id: 'web_push'
    });

    this.setState({ comment: '' });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">React Client</h1>
        </header>
        <div className="container">
          <br />
          <form onSubmit={this.onSubmit}>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">From</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" value={this.state.from} onChange={this.onChangeFrom} required />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">To</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" value={this.state.to} onChange={this.onChangeTo} onBlur={this.onBlurTo} required />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label">Comment</label>
              <div className="col-sm-10">
                <textarea className="form-control" value={this.state.comment} onChange={this.onChangeComment} rows={5} cols={50} required></textarea>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
          {
            <ul>
              {
                this.state.comments.map((item, index) => {
                  return <li key={index}>
                    {item.comment} &bull; <strong>{item.from}</strong>
                  </li>;
                })
              }
            </ul>
          }
        </div>
        
        {/*<div className="container">
          <div className="col-md-12" style={{marginTop: '2rem'}}>
            <form>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Your Username</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" placeholder="Username" onChange={this.onChangeUsername} />
                </div>
              </div>
            </form>
          </div>
          {
            this.state.posts.map((post, i) => <PostCard post={post} from={this.state.username} key={i} />)
          }
        </div>*/}
      </div>
    );
  }
}

export default App;
