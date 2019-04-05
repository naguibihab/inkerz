import React, { Component } from 'react'
import './App.css'
import axios from 'axios'
import Comic from './Comic.js'
class App extends Component {
  constructor () {
    super()
    this.state = {
      loadTime: 0,
      comics: [],
      searchQuery: '',
      timer: 0
    }
    this.searchByTitle = this.searchByTitle.bind(this);
    this.loadComics = this.loadComics.bind(this);

    this.loadComics();
  }

  loadComics (searchQuery = null) {
    let url = 'https://g99zlbwhqc.execute-api.us-east-1.amazonaws.com/dev/comics?limit=10';
    if(searchQuery != null) {
      url += "&titleStartsWith="+searchQuery
    }
    console.log("url",url)
    axios.get(url)
    .then(response => {
      console.log(response.data.resp.data)
      this.setState({
        loadTime: response.data.meta.timeElapsed,
        comics: response.data.resp.data.results
      })
    })
  }

  searchByTitle (query) {
    this.setState({searchQuery: query});

    // Trigger api call after 0.5 seconds of inactivity
    clearTimeout(this.state.timer)
    this.state.timer = setTimeout(
      function() {
        this.loadComics(query)
      }.bind(this),
      500
    )
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
      <div className="body">
        <div className="comics">
          <h2> Comics: </h2>
          Search: <input 
                    type="text" 
                    name="searchByTitle" 
                    placeholder="Search"
                    value={this.state.searchQuery} 
                    onChange={e => this.searchByTitle(e.target.value)}
                  />
          {this.renderComics()}
        </div>
        <hr></hr>
        <div className="meta">
          {this.renderMeta()}
        </div>
      </div>
    )
  }
}
export default App