import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import activities from '../lib/activities';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

const visitors = ['Everyone', 'History Buffs', 'Families', 'Casual Travelers', 'Teens & Adults', 'Outdoor Enthusiast', 'Nature Lovers'];

export default class ReviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      validated: false,
      results: [],
      isLoading: true,
      rating: '',
      activities: [],
      visitors: [],
      tips: '',
      generalThoughts: '',
      startDate: '',
      endDate: '',
      image: null,
      dateError: '',
      networkError: false
    };
    this.fileInputRef = React.createRef();
    this.fetchData = this.fetchData.bind(this);
    this.handleCheckBox = this.handleCheckBox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.retrieveReview = this.retrieveReview.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.postReview = this.postReview.bind(this);
  }

  componentDidMount() {
    this.fetchData();
    this.retrieveReview();
  }

  async retrieveReview() {
    const parkCode = this.props.park;
    const token = window.localStorage.getItem('park-reviews-jwt');
    const header = {
      headers: {
        'X-Access-Token': token
      }
    };
    try {
      const response = await fetch(`/api/edit/${parkCode}`, header);
      const result = await response.json();
      if (result.length === 0) {
        return;
      }
      const { rating, datesVisited, recommendedActivities, recommendedVisitors, tips, imageUrl } = result[0];
      const startDate = datesVisited.split(',')[0].split('[')[1];
      const endDate = datesVisited.split(',')[1].split(')')[0];
      const activities = recommendedActivities.split(',');
      const visitors = recommendedVisitors.split(',');
      const generalThoughts = result[0].generalThoughts === null ? '' : result[0].generalThoughts;
      this.setState({
        rating,
        activities,
        visitors,
        endDate,
        startDate,
        tips,
        generalThoughts,
        image: imageUrl,
        editing: true
      });
    } catch (err) {
      console.error(err);
      this.setState({
        isLoading: false,
        networkError: true
      });
    }
  }

  handleClick() {
    window.history.back();
  }

  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;
    if (event.target.name === 'image') {
      this.setState({
        image: null
      });
      return;
    }
    if (event.target.name === 'endDate' || event.target.name === 'startDate') {
      this.setState({
        dateError: '',
        [name]: value
      });
      return;
    }
    this.setState({
      [name]: value
    });
  }

  handleCheckBox(event) {
    const target = event.target;
    const name = event.target.name;
    const array = this.state[name];
    if (event.target.name === 'activities' && target.checked === true) {
      this.setState({
        name: array.push(event.target.id),
        activitiesError: ''
      });
    } else if (event.target.name === 'visitors' && target.checked === true) {
      this.setState({
        name: array.push(event.target.id),
        visitorsError: ''
      });
    } else if (target.checked === false) {
      const index = array.indexOf(event.target.id);
      this.setState({
        name: array.splice(index, 1)
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      this.setState({
        validated: true
      });
      return;
    }

    const startDate = new Date(this.state.startDate);
    const endDate = new Date(this.state.endDate);
    const startParse = Date.parse(startDate);
    const endParse = Date.parse(endDate);
    if (startParse > endParse) {
      this.setState({
        dateError: 'End date must be after the start date.'
      });
      return;
    }

    if (this.state.activities.length === 0) {
      this.setState({
        activitiesError: 'Must select at least one activity.'
      });
      return;
    } if (this.state.visitors.length === 0) {
      this.setState({
        visitorsError: 'Must select at least one visitor group.'
      });
      return;
    }

    this.setState({
      isLoading: true
    });

    const parkDetails = {
      name: this.state.results.name,
      imageUrl: this.state.results.wikiImage
    };

    const dates = [this.state.startDate, this.state.endDate];
    const image = this.fileInputRef.current.files[0] ? this.fileInputRef.current.files[0] : null;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('parkCode', this.props.park);
    formData.append('recommendedActivities', this.state.activities);
    formData.append('recommendedVisitors', this.state.visitors);
    formData.append('tips', this.state.tips);
    formData.append('generalThoughts', this.state.generalThoughts);
    formData.append('rating', this.state.rating);
    formData.append('datesVisited', dates);
    formData.append('stateCode', this.state.results.addresses[0].stateCode);
    formData.append('parkDetails', JSON.stringify(parkDetails));
    const token = window.localStorage.getItem('park-reviews-jwt');
    const action = this.state.editing ? 'PUT' : 'POST';
    const requestOptions = {
      method: action,
      headers: {
        'X-Access-Token': token
      },
      body: formData
    };
    this.postReview(requestOptions);
  }

  async postReview(options) {
    try {
      const response = await fetch('/api/reviews', options);
      const result = await response.json();
      if (this.state.editing) {
        window.location.hash = `#accounts/reviews?state=${this.state.results.addresses[0].stateCode}`;
        return result;
      }
      window.location.hash = `#details?park=${this.props.park}`;
    } catch (err) {
      console.error(err);
      this.setState({
        networkError: true,
        isLoading: false
      });
    }
  }

  async fetchData() {
    const search = this.props.park;
    const parkKey = process.env.PARKS_API;
    const action = 'parkCode=';
    const link = `https://developer.nps.gov/api/v1/parks?${action}${search}&api_key=${parkKey}`;
    try {
      const response = await fetch(link);
      const result = await response.json();
      const apiEndPoint = 'https://en.wikipedia.org/w/api.php';
      const state = result.data[0];
      const title = state.fullName.replaceAll(' ', '%20');
      const params = `action=query&format=json&prop=pageimages&titles=${title}&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=500&pilimit=3`;
      const url = apiEndPoint + '?' + params + '&origin=*';
      const imageResponse = await fetch(url);
      const image = await imageResponse.json();
      if (image.query.pages[0].thumbnail === undefined) {
        state.wikiImage = '/images/mountains.webp';
      } else {
        state.wikiImage = image.query.pages[0].thumbnail.source;
      }
      this.setState({
        results: state,
        isLoading: false
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const spinner = this.state.isLoading === true
      ? (<div className="lds-ring"><div /><div /><div /><div /></div>)
      : '';

    if (this.state.isLoading) {
      return spinner;
    }
    if (this.state.networkError) {
      return (
        <Container>
          <h3 className='lh-lg pt-4 mt-4 merriweather text-center'>Sorry, there was an error connecting to the network! Please check your internet connection and try again.</h3>
        </Container>
      );
    }
    let image = '';
    if (this.state.editing === true && this.state.image !== null) {
      image = (
        <>
          <p className='fst-italic mt-2'>Previously uploaded image:</p>
          <Image thumbnail className='thumbnail shadow-sm' src={this.state.image} alt='User Image' />
        </>);
    }
    const { name } = this.state.results;
    const star5 = this.state.rating === 5
      ? <input defaultChecked='true' required id='rating-5' className='px-1' type='radio' name='rating' value='5' onClick={this.handleInputChange} />
      : <input required id='rating-5' className='px-1' type='radio' name='rating' value='5' onClick={this.handleInputChange} />;
    const star4 = this.state.rating === 4
      ? <input defaultChecked='true' required id='rating-4' className='px-1' type='radio' name='rating' value='4' onClick={this.handleInputChange} />
      : <input required id='rating-4' className='px-1' type='radio' name='rating' value='4' onClick={this.handleInputChange} />;
    const star3 = this.state.rating === 3
      ? <input defaultChecked='true' required id='rating-3' className='px-1' type='radio' name='rating' value='3' onClick={this.handleInputChange} />
      : <input required id='rating-3' className='px-1' type='radio' name='rating' value='3' onClick={this.handleInputChange} />;
    const star2 = this.state.rating === 2
      ? <input defaultChecked='true' required id='rating-2' className='px-1' type='radio' name='rating' value='2' onClick={this.handleInputChange} />
      : <input required id='rating-2' className='px-1' type='radio' name='rating' value='2' onClick={this.handleInputChange} />;
    const star1 = this.state.rating === 1
      ? <input defaultChecked='true' required id='rating-1' className='px-1' type='radio' name='rating' value='1' onClick={this.handleInputChange} />
      : <input required id='rating-1' className='px-1' type='radio' name='rating' value='1' onClick={this.handleInputChange} />;

    const today = new Date();
    const todayDate = today.toLocaleDateString().split('/');
    const todayFormat = `${todayDate[2]}-${todayDate[0]}-${todayDate[1]}`;

    return (
      <>
        <div className='mb-4 position-relative hero-background text-center'>
          <img src='images/placeholder-trees.webp' alt='Group of trees' className='hero-image' />
          <h2 className='w-100 merriweather fw-bold position-absolute top-50 start-50 translate-middle text-white'><span className='fa-solid fa-pen-to-square pe-2' />Review Form</h2>
        </div>
        <Container className='mb-4'>
          <h2 className='merriweather fw-bold large-screen-spacing'>{name}</h2>
          <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit} className='large-screen-spacing open-sans gray-scale'>
            <Form.Group className='d-flex'>
              <Col xs={2} md={1}>
                <Form.Label htmlFor='rating-5' className='fs-6 pb-4 m-0'>
                  Rating:
                </Form.Label>
              </Col>
              <Col xs={3}>
                <div className='star-radio d-flex flex-row-reverse justify-content-end'>
                  {star5}
                  <label htmlFor='rating-5' className='pt-1 fa-solid fa-star' />
                  {star4}
                  <label htmlFor='rating-4' className='pt-1 fa-solid fa-star' />
                  {star3}
                  <label htmlFor='rating-3' className='pt-1 fa-solid fa-star' />
                  {star2}
                  <label htmlFor='rating-2' className='pt-1 fa-solid fa-star' />
                  {star1}
                  <label htmlFor='rating-1' className='pt-1 fa-solid fa-star' />
                  <Form.Control.Feedback type="invalid">Missing rating.</Form.Control.Feedback>

                </div>
              </Col>

            </Form.Group>
            <Row>
              <Col sm={12} lg={6}>
                <Form.Group className='mb-3'>
                  <h5 className='mb-0 pb-1'><span className='fa-regular fa-calendar-days pe-2' />Dates Visited*</h5>
                  <hr className='mt-0'/>
                  <div className='mb-2'>
                    <Form.Label htmlFor='start-dates' className='pe-2 fw-light mb-0'> Start Date: </Form.Label>
                    <input required value={this.state.startDate} className='border gray-scale' min="1970-01-01" max={todayFormat} id='start-dates' type='date' name='startDate' onChange={this.handleInputChange}/>
                    <Form.Control.Feedback type="invalid">Missing start date.</Form.Control.Feedback>
                  </div>
                  <div className='mt-3'>
                    <Form.Label htmlFor='end-dates' className='mb-0 pe-3 fw-light'> End Date: </Form.Label>
                    <input value={this.state.endDate} className='border gray-scale' required id='end-dates' type='date' name='endDate' min="1970-01-01" max={todayFormat} onChange={this.handleInputChange}/>
                    <Form.Control.Feedback type="invalid">Missing end date.</Form.Control.Feedback>
                    <Form.Text className='d-block text-danger'>{this.state.dateError}</Form.Text>
                  </div>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <h5 className='mb-0 pb-1'><span className="fa-solid fa-person-biking pe-2" />Recommended Activities*</h5>
                  <hr className='mt-0'/>
                  <Row>
                    {
                activities.map(activity => {
                  let activityOption = <input type='checkbox' id={activity.name} name='activities' value={activity.name} onChange={this.handleCheckBox} />;
                  if (this.state.activities.includes(activity.name)) {
                    activityOption = <input defaultChecked='true' type='checkbox' id={activity.name} name='activities' value={activity.name} onChange={this.handleCheckBox} />;
                  }
                  return (
                    <Col xs={6} key={activity.name}>
                      {activityOption}
                      <label htmlFor={activity.name} className='fw-light ps-2 lh-lg'>{activity.name}</label>
                    </Col>
                  );
                })
              }
                    <Form.Text className='d-block text-danger'>{this.state.activitiesError}</Form.Text>
                  </Row>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <h5 className='mb-0 pb-1'><span className="fa-solid fa-user-group pe-2" />Recommended Visitors*</h5>
                  <hr className='mt-0'/>
                  <Row>
                    {
                      visitors.map(visitor => {
                        let visitorOption = <input type='checkbox' id={visitor} name='visitors' value={visitor} onChange={this.handleCheckBox} />;
                        if (this.state.visitors.includes(visitor)) {
                          visitorOption = <input defaultChecked='true' type='checkbox' id={visitor} name='visitors' value={visitor} onChange={this.handleCheckBox} />;
                        }
                        return (
                          <Col xs={6} key={visitor}>
                            {visitorOption}
                            <label htmlFor={visitor} className='fw-light ps-2 lh-lg'>{visitor}</label>
                          </Col>
                        );
                      })
                    }
                    <Form.Text className='d-block text-danger'>{this.state.visitorsError}</Form.Text>
                  </Row>
                </Form.Group>
              </Col>
              <Col sm={12} lg={6}>
                <Form.Group className='mb-3'>
                  <Form.Label htmlFor='tips' className='mb-0 pb-1 fs-5'>
                    <span className='fa-solid fa-info-circle pe-2' />Tips*
                  </Form.Label>
                  <hr className='my-0' />
                  <Form.Text className='fs-6 fst-italic fw-light'>
                    Provide future visitors with tips for a great experience at {this.state.results.name}.
                  </Form.Text>
                  <Form.Control placeholder='Provide tips here' className='text-box mt-3' required id='tips' name='tips' as='textarea' value={this.state.tips} onChange={this.handleInputChange} />
                  <Form.Control.Feedback type="invalid">Write at least one tip</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label htmlFor='generalThoughts' className='mb-0 pb-1 fs-5'>
                    <span className='fa-solid fa-lightbulb pe-2' />General Thoughts
                  </Form.Label>
                  <hr className='my-0' />
                  <Form.Text className='fs-6 fst-italic fw-light'>
                    Explain your rating or write about a memorable experience at {this.state.results.name}.
                  </Form.Text>
                  <Form.Control id='generalThoughts' name='generalThoughts' as='textarea' className='text-box mt-3' value={this.state.generalThoughts} onChange={this.handleInputChange} placeholder='Write your thoughts here' />
                  <Form.Control.Feedback type="valid">General Thoughts are optional</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={6}>
                <Form.Group className='mb-3'>
                  <Form.Label htmlFor='image' className='mb-0 pb-1 fs-5'>
                    <span className='fa-solid fa-camera-retro pe-2' />Photos
                  </Form.Label>
                  <hr className='my-0' />
                  <Form.Text className='fs-6 fst-italic fw-light'>
                    Upload your favorite photo from this park.
                  </Form.Text>
                  <Form.Control onChange={this.handleInputChange} id='image' className='mt-3' name='image' type='file' accept='.png, .jpg, .jpeg, .gif' ref={this.fileInputRef}/>
                  <Form.Control.Feedback type="valid">Photo is optional</Form.Control.Feedback>
                  {image}
                </Form.Group>
              </Col>
            </Row>
            <Row className='my-2'>
              <Col>
                <Button className='btn btn-secondary merriweather lh-lg px-4' onClick={this.handleClick}>
                  Cancel
                </Button>
              </Col>
              <Col className='text-end'>
                <Button className='merriweather lh-lg px-4' variant="success" type='submit'>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </>
    );
  }
}
