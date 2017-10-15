import React from 'react';

import './App.css';
import Header from './header/Header';
import Body from './body/Body';
import Footer from './footer/Footer';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Body />
        <Footer />
      </div>
    );
  }
}