import React, { Component } from 'react'
import './App.css'
import axios from 'axios'
import Comic from './Comic.js'
class App extends Component {
  constructor () {
    super()
    this.state = {
      loadTime: 0,
      comics: []
    }
    this.loadComics = this.loadComics.bind(this)
    this.loadComics()
  }

  loadComics () {
    axios.get('https://g99zlbwhqc.execute-api.us-east-1.amazonaws.com/dev/comics')
    .then(response => {
      console.log(response.data.resp.data)
      this.setState({
        loadTime: response.data.meta.timeElapsed,
        comics: response.data.resp.data.results
      })
    })
  }

  renderMeta () {
    return (
      <pre>
        Loaded in: {this.state.loadTime / 1000} seconds
      </pre>
    )
  }

  renderComics () {
    return (
      <div>
        {this.state.comics.map((comic,key) =>
          <Comic comic={comic} key={comic.id}></Comic>
        )}
      </div>
    )
  }

  render () {
    return (
      <div class="body">
        <div class="comics">
          <h2> Comics: </h2>
          {this.renderComics()}
        </div>
        <hr></hr>
        <div class="meta">
          {this.renderMeta()}
        </div>
      </div>
    )
  }
}
export default App