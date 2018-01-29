// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

type Props = {
  name?: string;
  _text?: string;
  'aria-describedby'?: string;
  children?: React.Node;
};

type testProps = {
  test?: string
};

class Baz extends React.Component<Props> {

  render() {
    return <div {...this.props} />;
  }
  static handledProps = ['_text', 'aria-describedby', 'children', 'name'];
}

export default Baz;