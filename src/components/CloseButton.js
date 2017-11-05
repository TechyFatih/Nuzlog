import React from 'react';
import { Button } from 'react-bootstrap';

export default props => {
  return (
    <Button className='close' aria-label='Close' onClick={props.onClick}>
      <span aria-hidden='true'>&times;</span>
    </Button>
  );
};