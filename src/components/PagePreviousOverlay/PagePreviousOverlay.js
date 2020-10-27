import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import getClassName from 'helpers/getClassName';
import Button from 'components/Button';
import selectors from 'selectors';

import './PagePreviousOverlay.scss';

class PagePreviousOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onClick = () => {
    if (this.props.currentPage === 1) {
      console.warn('you are at the first page');
    } else {
      const nextPage = this.props.currentPage - 1;
      core.setCurrentPage(nextPage);  
    }
  }

  render() {
    const { isDisabled } = this.props;
    if (isDisabled) {
      return null;
    }

    const className = getClassName(`Overlay PagePreviousOverlay`, this.props);
    
    return (
      <div className={className} data-element="pagePreviousOverlay">
        <Button
          {...this.props}
          title="Go to previous page"
          img="ic_chevron_left_black_24px"
          onClick={this.onClick}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pagePreviousOverlay'),
  isOpen: selectors.isElementOpen(state, 'pagePreviousOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
});

export default connect(mapStateToProps)(PagePreviousOverlay);