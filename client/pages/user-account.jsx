import React from 'react';
import defaultStates from '../lib/default-state-count';
import * as topojson from 'topojson-client';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import escape from 'escape-html';
import * as d3 from 'd3';
import states from '../lib/states';
import AppContext from '../lib/app-context';

let deepCopyDefaultStates = JSON.parse(JSON.stringify(defaultStates));

export default class UserAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      isLoading: true,
      networkError: false
    };
    this.renderInfographic = this.renderInfographic.bind(this);
    this.infographicMap = React.createRef();
  }

  async componentDidMount() {
    if (!this.context.user) {
      return;
    }
    const token = window.localStorage.getItem('park-reviews-jwt');
    const request = {
      method: 'GET',
      headers: {
        'X-Access-Token': token
      }
    };
    try {
      const response = await fetch('/api/accounts/', request);
      const result = await response.json();
      if (result[0].length !== 0) {
        result[0].forEach(element => {
          const stateCode = element.stateCode;
          if (deepCopyDefaultStates[stateCode]) {
            deepCopyDefaultStates[stateCode].visits = element.visits;
          }
        });
        this.renderInfographic();
        this.setState({
          results: result[0],
          total: result[1][0].reviews,
          isLoading: false
        });
      } else {
        this.renderInfographic();
        this.setState({
          results: null,
          total: 'N/A',
          isLoading: false
        });
      }
    } catch (err) {
      console.error(err);
      this.setState({
        networkError: true,
        isLoading: false
      });
    }
  }

  componentWillUnmount() {
    deepCopyDefaultStates = JSON.parse(JSON.stringify(defaultStates));
  }

  async renderInfographic() {
    try {
      const dataObject = {};
      for (const key in deepCopyDefaultStates) {
        const stateName = deepCopyDefaultStates[key].name;
        const visits = deepCopyDefaultStates[key].visits;
        dataObject[stateName] = Number(visits);
      }
      const color = d3.scaleQuantize()
        .domain([0, 9])
        .range(d3.schemeGreens[9]);

      const path = d3.geoPath();
      const svg = d3.select(this.infographicMap.current)
        .append('svg')
        .attr('viewBox', '0 0 975 610');

      const toolTip = d3.select(this.infographicMap.current)
        .append('div')
        .style('position', 'absolute')
        .attr('class', 'tooltip');

      const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json');
      svg.append('g')
        .selectAll('path')
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append('path')
        .attr('d', path)
        .attr('class', 'states')
        .style('fill', d => color(dataObject[d.properties.name]))
        .style('stroke', '#636363');

      svg.selectAll('path')
        .on('click', (event, d) => {
          const name = d.properties.name;
          if (dataObject[name] === 0) {
            return;
          }
          if (this.state.name === name) {
            const state = states.find(state => state.name === name);
            const stateCode = state.code;
            window.location.hash = `#accounts/reviews?state=${stateCode}`;
          } else {
            this.setState({
              name
            });
          }
        })
        .on('mouseover', function (event, d) {
          d3.selectAll('.states')
            .transition()
            .duration(200)
            .style('stroke-width', '1px')
            .style('opacity', 0.8)
            .style('box-shadow', '2px 2px 0.5rem black');

          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('stroke-width', '2px')
            .style('cursor', 'pointer');

          d3.select('.tooltip')
            .style('opacity', 1);

        })
        .on('mouseout', function (event) {
          d3.selectAll('.states')
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('stroke-width', '1px');

          toolTip.style('opacity', 0);
        })
        .on('mousemove', function (event, d) {
          const offsetX = event.layerX > parent.innerWidth * 0.5 ? '-105%' : '5%';
          const offsetY = event.layerY > parent.innerWidth * 0.5 ? '-105%' : '5%';
          const offset = `translate(${offsetX}, ${offsetY})`;

          toolTip
            .html(`<h6 class='open-sans mb-0 mt-2'>${escape(d.properties.name)}</h6>
              <p class='open-sans fw-light'> Number of visits: <span class='fw-bold'>${escape(dataObject[d.properties.name])}</span></p>`)
            .style('left', (event.layerX) + 'px')
            .style('top', (event.layerY) + 'px')
            .style('transform', offset);
        });
      return svg.node();

    } catch (err) {
      console.error(err);
    }
  }

  render() {
    if (!this.context.user) {
      window.location.hash = '#sign-in';
      return;
    }
    const spinner = this.state.isLoading === true
      ? (<div className="lds-ring"><div /><div /><div /><div /></div>)
      : '';

    if (this.state.networkError) {
      return (
        <Container>
          <h3 className='lh-lg pt-4 mt-4 merriweather text-center'>Sorry, there was an error connecting to the network! Please check your internet connection and try again.</h3>
        </Container>
      );
    }

    const statesNeeded = this.state.results ? 50 - this.state.results.length : 'N/A';
    let mostVisited = 'N/A';
    if (this.state.results && this.state.results.length > 0) {
      const stateCode = this.state.results[0].stateCode;
      mostVisited = Object.values(deepCopyDefaultStates[stateCode].name);
    }

    return (
      <>
        <div className='mb-4 position-relative hero-background text-center'>
          <img src='images/joshua-tree.webp' alt='Mountain view with lake' className='hero-image' />
          <h2 className='w-100 merriweather fw-bold position-absolute top-50 start-50 translate-middle text-white'>
            <span className='fa-solid fa-map pe-2' />Account Information
          </h2>
        </div>
        <Container>
          {spinner}
          <Row className='my-4 justify-content-center'>
            <Col xs={12}>
              <h2 className='merriweather text-center'>Park Tracker</h2>
              <h5 className='merriweather fst-italic text-center fw-light'>Double click a state you&apos;ve visited to see your reviews. </h5>
            </Col>
            <Col lg={9}>
              <div id="map" ref={this.infographicMap} />
            </Col>
          </Row>
          <Row className='justify-content-end'>
            <Col xs={7} md={4} lg={5} xl={4}>
              <table className='text-center bg-light rounded'>
                <thead>
                  <tr>
                    <th colSpan="12" className='merriweather lh-lg pt-2 fs-6 fw-light'> Total Parks Visited
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='scale'>
                    <td />
                    <td className='zero border' />
                    <td className='one border' />
                    <td className='two border' />
                    <td className='three border' />
                    <td className='four border' />
                    <td className='five border' />
                    <td className='six border' />
                    <td className='seven border' />
                    <td className='eight border' />
                    <td className='nine border' />
                    <td />
                  </tr>
                  <tr className='scale open-sans fw-light'>
                    <td />
                    <td>0</td>
                    <td />
                    <td />
                    <td>3</td>
                    <td />
                    <td />
                    <td>6</td>
                    <td />
                    <td />
                    <td>9+</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col lg={9} className='my-4'>
              <h4 className='merriweather'>Your Statistics</h4>
              <h6 className='open-sans fw-light lh-lg'>Total number of parks visited: <span className='fw-bold'>{this.state.total}</span></h6>
              <h6 className='open-sans fw-light lh-lg'>Most visited state&apos;s parks: <span className='fw-bold'>{mostVisited}</span></h6>
              <h6 className='open-sans fw-light lh-lg'>Number of states left to visit: <span className='fw-bold'>{statesNeeded}</span></h6>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

UserAccount.contextType = AppContext;
