import React from 'react';
import PropTypes from 'prop-types';
import { extent as d3Extent } from 'd3-array';

import PointSeries, {
  propTypes as pointSeriesPropTypes,
  defaultProps as pointSeriesDefaultProps,
} from './PointSeries';

import computeCirclePack from '../utils/computeCirclePack';

const propTypes = {
  ...pointSeriesPropTypes,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      // x should be anything sortable
      x: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.instanceOf(Date)]),
      size: PropTypes.number,
    }),
  ).isRequired,
  layoutCallback: PropTypes.func,
};

const defaultProps = {
  ...pointSeriesDefaultProps,
  size: d => d.size || 4,
  layoutCallback: null,
};

class CirclePackSeries extends React.PureComponent {
  constructor(props) {
    super(props);
    this.computeCirclePack = this.computeCirclePack.bind(this);
    this.state = { data: this.computeCirclePack(props) };
  }

  componentWillReceiveProps(nextProps) {
    if (['data', 'xScale', 'size'].some(prop => this.props[prop] !== nextProps[prop])) {
      this.setState({ data: this.computeCirclePack(nextProps) });
    }
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  computeCirclePack({ data: rawData, xScale, yScale, size, layoutCallback }) {
    const data = computeCirclePack(rawData, xScale, size);

    // callback enables the user to re-set the chart height if there is overflow
    if (layoutCallback) {
      if (this.timeout) clearTimeout(this.timeout);

      const [min, max] = d3Extent(data, d => d.y);
      this.timeout = setTimeout(() => {
        layoutCallback({
          range: [min, max], domain: [yScale(min), yScale(max)],
        });
      }, 10);
    }

    return data;
  }

  render() {
    const { data } = this.state;

    return <PointSeries {...this.props} data={data} />;
  }
}

CirclePackSeries.propTypes = propTypes;
CirclePackSeries.defaultProps = defaultProps;
CirclePackSeries.displayName = 'CirclePackSeries';

export default CirclePackSeries;
