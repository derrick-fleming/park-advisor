import React from 'react';
import Home from './pages/home';
import parseRoute from './lib/parse-route';
import SearchResults from './pages/searchResults';
// For the Navigation Bar //
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleGlass: false
    };
    this.revealSearch = this.revealSearch.bind(this);
  }

  revealSearch() {
    if (this.state.toggleGlass) {
      this.setState({ toggleGlass: false });
    } else {
      this.setState({ toggleGlass: true });
    }
  }

  render() {

    const expand = 'lg';
    let iconClass = 'fa-magnifying-glass';
    let buttonClass = 'search-hide';
    if (this.state.toggleGlass) {
      iconClass = 'fa-xmark';
      buttonClass = 'd-flex';
    }
    return (
      <Navbar variant="dark" expand={expand} className="mb-3 search-green">
        <Container fluid className="flex-nowrap">
          <Navbar.Brand className="text-white"href="#home">Parks</Navbar.Brand>

          <Form className={buttonClass}>
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-light">Search</Button>
          </Form>
          <button className='navbar-toggler' onClick={this.revealSearch}>
            <span>
              <i className={`fa-solid ${iconClass}`} />
            </span>
          </button>
        </Container>
      </Navbar>
    );
  }

}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      route: parseRoute(window.location.hash)
    };
  }

  render() {
    if (this.state.route.path === 'search-results') {
      const search = this.state.route.params.get('search');
      return <SearchResults search={search} />;
    }
    return (
      <>
        <NavigationBar />
        <Home />
      </>
    );
  }
}
