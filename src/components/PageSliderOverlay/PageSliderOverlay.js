import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import getClassName from 'helpers/getClassName';
import selectors from 'selectors';

import './PageSliderOverlay.scss';

class PageSliderOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
  }

  componentDidUpdate() {
    this.sliderRef.current.value = this.props.currentPage;
  }

  handleChange = event => {
    core.setCurrentPage(event.target.value);
  }

  render() {
    const { isDisabled, currentPage, totalPages } = this.props;
    if (isDisabled) {
      return null;
    }

    const className = getClassName(`Overlay PageSliderOverlay`, this.props);
    
    return (
      <div className={className} data-element="pageSliderOverlay">
        <input type="range" ref={this.sliderRef} min="1" max={totalPages} defaultValue={currentPage} step="1" onChange={this.handleChange} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pageSliderOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageSliderOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
});

export default connect(mapStateToProps)(PageSliderOverlay);