import PropTypes from 'prop-types';
import React from 'react';

const propTypes={
  children: PropTypes.node,
  className: PropTypes.string
}

const defaultProps = {
  active: true
}

function Example() {
  return <div />;
}

Example.defaultProps = defaultProps;
Example.propTypes = propTypes;

export default Example;
