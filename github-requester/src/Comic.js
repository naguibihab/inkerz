import React, {Component} from 'react';
import './Comic.css'

class Comic extends Component {
    render() {
        return (
            <div>
                <p class="comic">{this.props.comic.title}</p>
            </div>
        );
    }
}

export default Comic;