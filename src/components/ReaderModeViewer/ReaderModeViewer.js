import React from 'react';
import core from 'core';
import PropTypes from 'prop-types';
import selectors from 'selectors';
import zoomFactors from 'constants/zoomFactors';
import { connect } from 'react-redux';
import setMaxZoomLevel from 'helpers/setMaxZoomLevel';

class ReaderModeViewer extends React.PureComponent {
  static propTypes = {
    containerWidth: PropTypes.number.isRequired,
  }
  constructor(props) {
    super(props);

    this.viewer = React.createRef();
    this.originalMaxZoom = zoomFactors.getMaxZoomLevel();
  }

  componentDidMount() {
    if (this.props.containerWidth > 0) {
      this.updateMaxZoom();
    }

    this.renderDocument();

    core.addEventListener('documentLoaded', this.renderDocument);
    core.addEventListener('pageNumberUpdated', this.goToPage);
    core.addEventListener('zoomUpdated', this.setZoom);
  }

  componentWillUnmount() {
    core.removeEventListener('documentLoaded', this.renderDocument);
    core.removeEventListener('pageNumberUpdated', this.goToPage);
    core.removeEventListener('zoomUpdated', this.setZoom);

    this.wvReadingMode?.unmount();

    setMaxZoomLevel(this.props.dispatch)(this.originalMaxZoom);
  }

  componentDidUpdate(prevProps) {
    if (this.props.containerWidth > 0 && prevProps.containerWidth !== this.props.containerWidth) {
      this.updateMaxZoom();
    }
  }

  render() {
    return (
      <div
        className="reader-mode-viewer"
        ref={this.viewer}
        style={{ height: "100%" }}
      >
      </div>
    );
  }

  renderDocument = () => {
    import('@pdftron/webviewer-reading-mode').then(({ default: WebViewerReadingMode }) => {
      if (!this.wvReadingMode) {
        this.wvReadingMode = WebViewerReadingMode.initialize(PDFNet);
      } else {
        this.wvReadingMode.unmount();
      }

      this.wvReadingMode.render(
        core.getDocumentViewer().getDocument().getPDFDoc(),
        this.viewer.current,
        {
          pageNumberUpdateHandler: core.setCurrentPage,
          pageNum: core.getCurrentPage()
        }
      );
      this.setZoom(core.getZoom());
    });
  }

  goToPage = (pageNum) => {
    this.wvReadingMode?.goToPage(pageNum);
  }

  setZoom = (zoom) => {
    this.wvReadingMode?.setZoom(zoom);
    const pageWidth = core.getDocumentViewer().getPageWidth(1);
    if (pageWidth) {
      this.viewer.current.style.width = `${pageWidth * zoom}px`;
    }
  }

  updateMaxZoom() {
    // Calling the FitWidth function to get the calculated fit width zoom level for normal page rendering
    const maxZoomLevel = core.getDocumentViewer().FitMode.FitWidth.call(core.getDocumentViewer());
    setMaxZoomLevel(this.props.dispatch)(maxZoomLevel);

    if (maxZoomLevel < core.getZoom()) {
      core.zoomTo(maxZoomLevel);
    }
  }
}

const mapStateToProps = state => ({
  containerWidth: selectors.getDocumentContainerWidth(state),
});

export default connect(mapStateToProps)(ReaderModeViewer);
