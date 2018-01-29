// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

type Props1 = {
  name?: string
}

type Props2 = {
  text?: string
}

type Props = $Diff<Props1, Props2>

class Baz extends React.Component<Props> {

  render() {
    return <div {...this.props} />;
  }
}

export default Baz;