import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import getClassName from 'helpers/getClassName';
import Button from 'components/Button';
import selectors from 'selectors';

import './PageNextOverlay.scss';

class PageNextOverlay extends React.PureComponent {
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
    if (this.props.currentPage === this.props.totalPages) {
      console.warn('you are at the last page');
    } else {
      const nextPage = this.props.currentPage + 1;
      core.setCurrentPage(nextPage);  
    }
  }

  render() {
    const { isDisabled } = this.props;
    if (isDisabled) {
      return null;
    }

    const className = getClassName(`Overlay PageNextOverlay`, this.props);
    
    return (
      <div className={className} data-element="pageNextOverlay">
        <Button
          {...this.props}
          title="Go to next page"
          img="ic_chevron_right_black_24px"
          onClick={this.onClick}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pageNextOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageNextOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
});

export default connect(mapStateToProps)(PageNextOverlay);