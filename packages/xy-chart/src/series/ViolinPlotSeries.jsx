import React from 'react';
import PropTypes from 'prop-types';
import Group from '@vx/group/build/Group';
import ViolinPlot from '@vx/stats/build/violinplot/ViolinPlot';
import themeColors from '@data-ui/theme/build/color';

import { callOrValue } from '../utils/chartUtils';

import { violinPlotSeriesDataShape } from '../utils/propShapes';
import sharedSeriesProps from '../utils/sharedSeriesProps';

const propTypes = {
  ...sharedSeriesProps,
  data: violinPlotSeriesDataShape.isRequired,
  horizontal: PropTypes.bool,
  fill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  stroke: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  strokeWidth: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  widthRatio: PropTypes.number,
};

const defaultProps = {
  stroke: themeColors.darkGray,
  strokeWidth: 2,
  fill: themeColors.default,
  horizontal: false,
  widthRatio: 1,
};

const MAX_BOX_WIDTH = 50;
const x = d => d.x;
const y = d => d.y;

export default function ViolinPlotSeries({
  data,
  fill,
  stroke,
  strokeWidth,
  xScale,
  yScale,
  horizontal,
  widthRatio,
  disableMouseEvents,
  onMouseMove,
  onMouseLeave,
  onClick,
}) {
  if (!xScale || !yScale) return null;
  const offsetScale = horizontal ? yScale : xScale;
  const offsetValue = horizontal ? y : x;
  const valueScale = horizontal ? xScale : yScale;
  const boxWidth = offsetScale.bandwidth();
  const actualWidth = Math.min(MAX_BOX_WIDTH, boxWidth);
  const offset = (offsetScale.offset || 0) - ((boxWidth - actualWidth) / 2);
  const offsetPropName = horizontal ? 'top' : 'left';
  const offsetProp = d => ({
    [offsetPropName]: (offsetScale(offsetValue(d)) - offset) +
     (((1 - widthRatio) / 2) * actualWidth),
  });
  return (
    <Group>
      {data.map((d, i) => (
        <ViolinPlot
          key={offsetValue(d)}
          {...offsetProp(d)}
          binData={d.binData}
          width={actualWidth * widthRatio}
          fill={d.fill || callOrValue(fill, d, i)}
          stroke={d.stroke || callOrValue(stroke, d, i)}
          strokeWidth={d.strokeWidth || callOrValue(strokeWidth, d, i)}
          valueScale={valueScale}
          horizontal={horizontal}
          onMouseMove={disableMouseEvents ? null : onMouseMove && (() => (event) => {
            onMouseMove({ event, data, datum: d, index: i });
          })}
          onMouseLeave={disableMouseEvents ? null : onMouseLeave && (() => onMouseLeave)}
          onClick={disableMouseEvents ? null : onClick && (() => (event) => {
            onClick({ event, data, datum: d, index: i });
          })}
        />
      ))
    }
    </Group>
  );
}

ViolinPlotSeries.propTypes = propTypes;
ViolinPlotSeries.defaultProps = defaultProps;
ViolinPlotSeries.displayName = 'ViolinPlotSeries';
