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
      timer: 0,
      
      page: 1,
      total: 0,
      limit: 10
    }
    this.searchByTitle = this.searchByTitle.bind(this);
    this.loadComics = this.loadComics.bind(this);
    this.setPage = this.setPage.bind(this);

    this.loadComics();
  }

  loadComics (offset = 0, searchQuery = null) {
    let url = 'https://g99zlbwhqc.execute-api.us-east-1.amazonaws.com/dev/comics?limit='+this.state.limit;
    url += "&offset="+offset
    if(searchQuery != null) {
      url += "&titleStartsWith="+searchQuery
    }
    console.log("url",url)
    axios.get(url)
    .then(response => {
      console.log(response.data.resp.data)
      this.setState({
        loadTime: response.data.meta.timeElapsed,
        comics: response.data.resp.data.results,
        total: response.data.resp.data.total
      })
    })
  }

  searchByTitle (query) {
    this.setState({searchQuery: query});

    // Trigger api call after 0.5 seconds of inactivity
    clearTimeout(this.state.timer)
    this.setState({
      timer: setTimeout(
        function() {
          this.loadComics(0,query)
        }.bind(this),
        500
      )
    })
  }

  setPage (pageNo) {
    let offset = (pageNo - 1) * this.state.limit
    this.loadComics(offset,null)
    this.setState({
      page: pageNo
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

  renderPagination () {
    const numberOfPages = Math.ceil(this.state.total / this.state.limit)
    let centerPage = this.state.page;
    if(centerPage < 3) {
      centerPage = 3
    } else if (centerPage > numberOfPages-2) {
      centerPage = numberOfPages-2
    }

    const visiblePages = [
      centerPage - 2,
      centerPage - 1,
      centerPage,
      centerPage +1,
      centerPage +2
    ]
    console.log('numberOfPages',numberOfPages)
    return (
      <ol className="pagination_group">
          <li className='pagination_item'>
              <a onClick={() => this.setPage(numberOfPages)}>Last</a>
          </li>

        {visiblePages.map((page) =>
          <li className={this.state.page === page ? 'pagination_item pagination_item_active' : 'pagination_item'}>
              <a onClick={() => this.setPage(page)}>
                {page}
              </a>
          </li>
        )}

          <li className='pagination_item'>
              <a onClick={() => this.setPage(numberOfPages)}>Last</a>
          </li>
      </ol>
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
        {this.renderPagination()}
        <hr></hr>
        <div className="meta">
          {this.renderMeta()}
        </div>
      </div>
    )
  }
}
export default App