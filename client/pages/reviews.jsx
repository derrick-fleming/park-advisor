import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import activities from '../lib/activities';

const visitors = ['Everyone', 'History Buffs', 'Families', 'Casual Travelers', 'Teens & Adults', 'Outdoor Enthusiasts', 'Nature Lovers'];

export default class ReviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      isLoading: true,
      rating: '',
      activities: [],
      visitors: []

    };
    this.fetchData = this.fetchData.bind(this);
    this.handleRating = this.handleRating.bind(this);
    this.handleCheckBox = this.handleCheckBox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  handleRating(event) {
    this.setState({
      rating: event.target.value
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleCheckBox(event) {
    const target = event.target;
    const name = event.target.name;
    const array = this.state[name];
    if (target.checked === true) {

      this.setState({
        name: array.push(event.target.id)
      });
    } else if (target.checked === false) {
      const index = array.indexOf(event.target.id);
      this.setState({
        name: array.splice(index, 1)
      });
    }
  }

  fetchData() {
    const search = this.props.park;
    const parkKey = process.env.PARKS_API;
    const action = 'parkCode=';
    let link = `https://developer.nps.gov/api/v1/parks?${action}${search}&api_key=${parkKey}`;
    link = 'get-parks-results.json';
    fetch(link)
      .then(response => response.json())
      .then(states => {
        const apiEndPoint = 'https://en.wikipedia.org/w/api.php';
        const imageFetches = states.data.map(state => {
          const title = state.fullName.replaceAll(' ', '%20');
          const params = `action=query&format=json&prop=pageimages&titles=${title}&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=500&pilimit=3`;
          return (
            fetch(apiEndPoint + '?' + params + '&origin=*')
              .then(response => response.json())
              .then(image => {
                if (image.query.pages[0].thumbnail === undefined) {
                  state.wikiImage = '/images/mountains.png';
                } else {
                  state.wikiImage = image.query.pages[0].thumbnail.source;
                }
              })
              .catch(err => console.error(err))
          );
        });
        Promise
          .all(imageFetches)
          .then(results => {
            this.setState({
              results: states.data[0],
              isLoading: false
            });
          });
      })
      .catch(err => console.error(err));
  }

  render() {
    if (this.state.isLoading) {
      return <div />;
    }
    const { name } = this.state.results;
    return (
      <Container>
        <h2>{name}</h2>
        <Form>
          <Form.Group className='d-flex'>
            <Col xs={2} md={1}>
              <Form.Label htmlFor='rating-5' className='pb-0 m-0'>
                Rating:
              </Form.Label>
            </Col>
            <Col xs={3}>
              <div className='star-radio d-flex flex-row-reverse justify-content-end'>
                <input required id='rating-5' className='px-1' type='radio' name='rating' value='5' onClick={this.handleRating} />
                <label htmlFor="rating-5" className='pt-1 fa-solid fa-star'/>
                <input className='px-1' id='rating-4' type='radio' name='rating' value='4' onClick={this.handleRating}/>
                <label htmlFor="rating-4" className='pt-1 fa-solid fa-star d-inline'/>
                <input className='px-1' id='rating-3' type='radio' name='rating' value='3' onClick={this.handleRating}/>
                <label htmlFor="rating-3" className='pt-1 fa-solid fa-star'/>
                <input className='px-1' id='rating-2' type='radio' name='rating' value='2' onClick={this.handleRating}/>
                <label htmlFor="rating-2" className='pt-1 fa-solid fa-star'/>
                <input className='px-1' id='rating-1' type='radio' name='rating' value='1' onClick={this.handleRating}/>
                <label htmlFor="rating-1" className='pt-1 fa-solid fa-star'/>
              </div>
            </Col>
          </Form.Group>
          <Form.Group>
            <h2><span className='fa-regular fa-calendar-days pe-2' />Dates Visited</h2>
            <hr />
            <div>
              <Form.Label htmlFor='start-dates'> Start Date: </Form.Label>
              <input id='start-dates' type='date'/>
            </div>
            <div>
              <Form.Label htmlFor='end-dates'> End Date: </Form.Label>
              <input id='end-dates' type='date' />
            </div>
          </Form.Group>
          <Form.Group>
            <h2><span className="fa-solid fa-person-biking pe-2" />Recommended Activities</h2>
            <hr />
            <Row>
              {
                activities.map(activity => {
                  return (
                    <Col xs={6} key={activity.name}>
                      <input type='checkbox' id={activity.name} name='activities' value={activity.name} onChange={this.handleCheckBox}/>
                      <label htmlFor={activity.name}>{activity.name}</label>
                    </Col>
                  );
                })
              }
            </Row>
          </Form.Group>
          <Form.Group>
            <h2><span className="fa-solid fa-person-hiking pe-2" />Recommended Visitors</h2>
            <hr />
            <Row>
              {
                visitors.map(visitor => {
                  return (
                    <Col xs={6} key={visitor}>
                      <input type='checkbox' id={visitor} name='visitors' value={visitor} onChange={this.handleCheckBox} />
                      <label htmlFor={visitor}>{visitor}</label>
                    </Col>
                  );
                })
              }
            </Row>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='tips'>
              <span className='fa-solid fa-info-circle' />Tips
            </Form.Label>
            <hr />
            <Form.Text>
              Provide future visitors with tips for a great experience at Devils Postpile
            </Form.Text>
            <Form.Control required id='tips' name='tips' type='text' onChange={this.handleInputChange}/>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='generalThoughts'>
              <span className='fa-solid fa-lightbulb' />General Thoughts
            </Form.Label>
            <hr />
            <Form.Text>
              Explain your rating or mention other activites someone should know about this park.            </Form.Text>
            <Form.Control id='generalThoughts' name='generalThoughts' type='text' onChange={this.handleInputChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='imageUrl'>
              <span className='fa-solid fa-camera' />Photos
            </Form.Label>
            <hr />
            <Form.Text>
              Upload your favorite photos from this park.
            </Form.Text>
            <Form.Control id='imageUrl' name='imageUrl' type='file' onChange={this.handleInputChange} />
          </Form.Group>
        </Form>
      </Container>
    );
  }
}
