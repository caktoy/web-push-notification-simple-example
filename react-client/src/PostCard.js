import React, { Component } from 'react';
import socketIO from 'socket.io-client';
import Push from 'push.js';
import moment from 'moment';

import 'bootstrap/dist/css/bootstrap.min.css';

const socket = socketIO('http://localhost:3030', { transports: ['websocket'] });

class PostCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			to: '',
			comment: '',
			comments: this.props.post.comments,
			users: [],
		}

		this.onChangeComment = this.onChangeComment.bind(this);
		this.onSubmitComment = this.onSubmitComment.bind(this);
	}

	componentDidMount() {
		socket.on('subscribed', (data) => {
			console.log('subscribed', data);
			this.setState({ users: data });
		});
		socket.on('comment received', data => {
			console.log('comment received', data);
			if (data.from !== this.props.from) {
				this.setState(state => {
					state.comments.push(data);
					return {
						comments: state.comments
					}
				});

				Push.create(`${data.from} post a comment`, {
					body: data.content,
					timeout: 3000,
				});
			}
		});
	}

	onChangeComment(e) {
		this.setState({ comment: e.target.value });
	}

	onSubmitComment(e) {
		e.preventDefault();
		
		if (this.state.comment !== '') {
			this.setState(state => {
				state.comments.push({
					from: this.props.from,
					content: this.state.comment,
					timestamps: moment()
				});
				return {
					comment: '',
					comments: state.comments
				}
			});

			socket.emit('subscribe', {
				post_id: this.props.post.id
			});

			socket.emit('post comment', {
				from: this.props.from, 
				to: this.state.to,
				content: this.state.comment,
				post_id: this.props.post.id,
				timestamps: moment(),

			});
		}
	}

	render() {
		const { post } = this.props;
		return <div className="col-md-12">
			<div className="card" style={{margin: '2rem 0'}}>
				<div className="card-body">
					<h5 className="card-title">{post.user}</h5>
					<p className="card-text">{post.content}</p>
					<hr />
					<p>Comments:</p>
					<ul style={{listStyle: 'none'}}>
						{
							post.comments.length > 0 ?
							post.comments.map((comment, j) => {
								return <li key={j}>
									<strong>{comment.from}</strong><br />
									{comment.content}<br />
									<small>{moment(comment.timestamps).fromNow()}</small>
								</li>
							}) :
							<li><i>Be the first to comment this post.</i></li>
						}
					</ul>
					<hr />
					<form onSubmit={this.onSubmitComment}>
						<div className="row">
							<div className="col-md-10">
								<input type="text" className="form-control" 
									placeholder="Write something..." required 
									value={this.state.comment} 
									onChange={this.onChangeComment}
									onFocus={e => this.setState({ to: post.user })} />
							</div>
							<div className="col-md-2">
								<button type="submit" className="btn btn-primary btn-block">Submit</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	}
}

export default PostCard;