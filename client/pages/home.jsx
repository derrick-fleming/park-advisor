import React from 'react';
import SearchBar from '../components/searchBar';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import activities from '../lib/activities';
import states from '../lib/states';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      selection: '',
      value: ''
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleClose(event) {
    this.setState({
      show: false,
      selection: ''
    });
    window.location.hash = '#home';
  }

  handleShow(event) {
    if (event.target.id === 'states') {
      this.setState({
        show: true,
        selection: 'states'
      });
    } else if (event.target.id === 'activities') {
      this.setState({
        show: true,
        selection: 'activities'
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.browse !== this.props.browse) {
      if (this.props.browse === 'states') {
        this.setState({
          show: true,
          selection: 'states'
        });
      } else if (this.props.browse === 'activities') {
        this.setState({
          show: true,
          selection: 'activities'
        });
      }
    }
  }

  componentDidMount() {
    if (this.props.browse === 'states') {
      this.setState({
        show: true,
        selection: 'states'
      });
    } else if (this.props.browse === 'activities') {
      this.setState({
        show: true,
        selection: 'activities'
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.value === '') {
      return;
    }
    const userInputValue = this.state.value;
    if (this.state.selection === 'states') {
      window.location.hash = 'state-results?search=' + userInputValue;
    } else {
      window.location.hash = 'search-results?search=' + userInputValue;
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    let choices = states;
    let modalTitle = 'Select a State';
    let modalBody = 'Find a park located near or in a state.';
    let firstOption = 'Choose a state';
    if (this.state.selection === 'activities') {
      choices = activities;
      modalTitle = 'Browse an activity';
      modalBody = 'Find a park that relates to an activity';
      firstOption = 'Choose an activity';
    }

    return (
      <>
        <SearchBar />
        <Container>
          <Row className='justify-content-center open-sans'>
            <Col md={6}>
              <Card className='mb-4 shadow-sm home-card'>
                <Card.Img variant="top" alt="Trees illustration" src="/images/placeholder-trees.png" className='image-size' />
                <Card.Body className='m-2'>
                  <Card.Title className='merriweather fw-bold fs-4'>States & Territories</Card.Title>
                  <Card.Text className='fs-6 pb-2'>
                    Browse through a list of states and territories to discover national parks found within each state.
                  </Card.Text>
                  <Button variant="success" className='merriweather lh-lg' onClick={this.handleShow} id='states'>Select a Location</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className='mb-4 shadow-sm home-card'>
                <Card.Img variant="top" alt="Mountain illustration" src="/images/placeholder-yosemite.png" className='image-size' />
                <Card.Body className='m-2'>
                  <Card.Title className='merriweather fw-bold fs-4'>Activities</Card.Title>
                  <Card.Text className='fs-6 pb-2'>
                    Browse through a list of activities to explore a park that matches your interests.
                  </Card.Text>
                  <Button variant="success" className='merriweather lh-lg px-4' id='activities' onClick={this.handleShow}>Browse</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal centered show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title className='merriweather gray-scale'>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='openSans fs-6 pt-4 gray-scale'>{modalBody}
            <Form className='pt-2' onSubmit={this.handleSubmit}>
              <Form.Select arialabel="Default select example" onChange={this.handleChange} value={this.state.value}>
                <option>{firstOption}</option>
                {
                choices.map(state => <option key={state.code} value={state.code}>{state.name}</option>)
                }
              </Form.Select>
              <Modal.Footer>
                <Button className='merriweather' variant="secondary" onClick={this.handleClose}>
                  Close
                </Button>
                <Button className='merriweather' variant="success" type="submit">
                  Browse
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>

        </Modal>
      </>
    );
  }

}
