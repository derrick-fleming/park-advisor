import React from 'react';
import parseRoute from './lib/parse-route';
import SearchResults from './pages/searchResults';
import Home from './pages/home';
import NavigationBar from './components/navigationBar';
import SearchBar from './components/searchBar';
import ParkDetails from './pages/details';
import ReviewPage from './pages/reviews';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      route: parseRoute(window.location.hash)
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
  }

  render() {
    if (this.state.route.path === '' || this.state.route.path === 'home') {
      const browse = this.state.route.params.get('browse');
      return (
        <>
          <NavigationBar />
          <Home browse={browse}/>
        </>
      );
    }
    if (this.state.route.path === 'search-results') {
      const search = this.state.route.params.get('search');
      const page = this.state.route.params.get('page');
      return (
        <>
          <NavigationBar />
          <SearchBar />
          <SearchResults search={search} action='search' page={page}/>
        </>
      );
    } else if (this.state.route.path === 'state-results') {
      const search = this.state.route.params.get('search');
      return (
        <>
          <NavigationBar />
          <SearchResults search={search} action='states' />
        </>
      );
    } else if (this.state.route.path === 'details') {
      const park = this.state.route.params.get('park');
      return (
        <>
          <NavigationBar />
          <ParkDetails search={park} />
        </>
      );
    } else if (this.state.route.path === 'reviews') {
      const review = this.state.route.params.get('parkCode');
      return (
        <>
          <NavigationBar />
          <ReviewPage park={review}/>
        </>
      );
    }

  }

}
