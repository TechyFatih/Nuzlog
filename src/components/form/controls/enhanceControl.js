import React from 'react';

export default (EnhancedControl) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = this.props.state.get(props.id);
      this.handleChange = this.handleChange.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
      this.setState(nextProps.state.get(nextProps.id));
    }

    componentDidUpdate() {
      if (this.input && this.state.focus) {
        this.input.focus();
      }
    }

    handleChange(value) {
      this.props.onChange(this.props.id, value);
    }

    render() {
      return (
        <EnhancedControl {...this.props}
          value={this.state.value}
          required={this.state.required}
          min={this.state.min}
          max={this.state.max}
          pristine={this.state.pristine}
          valid={this.state.valid}
          onChange={this.handleChange}
          getInput={input => this.input = input} />
      );
    }
  };
};