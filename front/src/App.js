import React, { Component } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

import './App.css'
import axios from 'axios'
import Comic from './Comic.js'

class App extends Component {
  constructor () {
    super()
    this.state = {
      // config
      loading: true,
      timer: 0,

      // data
      loadTime: undefined,
      comics: [],
      
      // filters
      searchQuery: '',
      orderBy: 'title',

      // pagination
      page: 1,
      total: 0,
      limit: 10
    }
    // Data
    this.loadComics = this.loadComics.bind(this);

    // Filters
    this.searchByTitle = this.searchByTitle.bind(this);
    this.orderByTitle = this.orderByTitle.bind(this);
    this.clearFilters = this.clearFilters.bind(this);

    // Pagination
    this.setPage = this.setPage.bind(this);
    
    this.loadComics(false, 0);
  }
  
  loadComics (clearState = true, offset = 0) {
    if (clearState)
      this.setState({
        loadTime: undefined,
        comics: [],
        loading: true
      })

    let url = 'https://g99zlbwhqc.execute-api.us-east-1.amazonaws.com/dev/comics?limit='+this.state.limit;
    url += "&offset="+offset
    
    // Filters
    if(this.state.searchQuery && this.state.searchQuery !== '') {
      url += "&titleStartsWith="+this.state.searchQuery
    }
    if(this.state.orderBy && this.state.orderBy !== '') {
      url += "&orderBy="+this.state.orderBy
    }

    console.log("url",url)
    axios.get(url)
    .then(response => {
      console.log(response.data.resp.data)
      this.setState({
        loadTime: response.data.meta.timeElapsed,
        comics: response.data.resp.data.results,
        total: response.data.resp.data.total,
        loading: false
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
          this.loadComics(true,0)
        }.bind(this),
        500
      )
    })
  }

  orderByTitle (query) {
    this.setState({orderBy: query});
    this.loadComics(true,0)
  }

  setPage (pageNo) {
    let offset = (pageNo - 1) * this.state.limit
    this.loadComics(true,offset)
    this.setState({
      page: pageNo
    })
  }

  clearFilters () {
    this.setState({
      searchQuery: '',
      orderBy: ''
    })
    this.loadComics(true,0)
  }

  renderMeta () {
    return (
      <pre>
        {this.state.loadTime >= 0 ? <span>Loaded in: {this.state.loadTime / 1000} seconds</span> : null}
      </pre>
    )
  }

  renderComics () {
    return (
      <div>
        <ClipLoader
          sizeUnit={"px"}
          size={100}
          color={'#123abc'}
          loading={this.state.loading}
        />
        {this.state.comics.map((comic,key) =>
          <Comic comic={comic} key={comic.id}></Comic>
        )}
      </div>
    )
  }

  renderFilters() {
      return (
        <div className="filters">
          <div>
            <label>Search by title:</label> 
            <input 
              type="text" 
              name="searchByTitle" 
              placeholder="title name"
              value={this.state.searchQuery} 
              onChange={e => this.searchByTitle(e.target.value)}
            />
          </div>

          <div>
            <label>Sort by title:</label> 
            <select value={this.state.orderBy} onChange={ e=> this.orderByTitle(e.target.value)}>
              <option value="title">Ascending</option>
              <option value="-title">Descending</option>
            </select>
          </div>

          <button onClick={this.clearFilters}>
            Clear
          </button>
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

        {visiblePages.map((page,key) =>
          <li key={key} className={this.state.page === page ? 'pagination_item pagination_item_active' : 'pagination_item'}>
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
        <div className="meta">
          {this.renderMeta()}
        </div>
        <div className="comics">
          <h2> Comics: </h2>
          {this.renderFilters()}
          {this.renderComics()}
        </div>
        {this.renderPagination()}
        <hr></hr>
      </div>
    )
  }
}
export default App