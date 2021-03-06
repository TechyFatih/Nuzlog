import React from 'react';
import { Modal, Media, Panel, Button, Row, Col, ControlLabel } from 'react-bootstrap';
import { actions } from 'react-redux-form';
import { connect } from 'react-redux';

import natures from 'data/natures.json';
import abilities from 'data/abilities.json';

import male from 'img/male.png';
import female from 'img/female.png';

import PokeSlot from 'components/pokemon/slot/PokeSlot';
import PokeSprite from 'components/pokemon/sprite/PokeSprite';

import { RRForm, RRFControl } from 'components/form/RRF';
import { addPokemon } from 'actions';

class AddModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemon: null,
      locations: {},
      validLocation: false,
      open: false
    };
    this.handleEnter = this.handleEnter.bind(this);
    this.updatePokemon = this.updatePokemon.bind(this);
    this.checkLocation = this.checkLocation.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleHide = this.handleHide.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    const {pokemon} = nextProps;
    if (this.props.pokemon != pokemon) {
      const locations = {};
      for (let i in pokemon)
        locations[pokemon[i].location] = true;
      
      this.setState({locations});
    }
  }
  
  handleEnter() {
    const {location} = this.props;
    this.setState({
      pokemon: null,
      open: false
    });
    this.dispatch(actions.change('local.location', location));
    this.checkLocation(location);
    this.dispatch(actions.setPristine('local'));
    this.dispatch(actions.focus('local.species'));
  }

  updatePokemon(pokemon) {
    this.setState(prevState => {
      return {
        pokemon: {...prevState.pokemon, ...pokemon}
      };
    });
  }

  checkLocation(location) {
    this.setState(({locations}) => ({
      validLocation: !locations[location]}
    ));
  }

  handleSubmit(values) {
    let moves;
    if (Array.isArray(values.moves))
      moves = values.moves.filter(move => move);
    
    this.props.onAddPokemon({
      species: values.species,
      nickname: values.nickname,
      location: values.location,
      level: values.level,
      gender: values.gender,
      shiny: values.shiny,
      form: values.form,
      nature: values.nature,
      ability: values.ability,
      moves,
      item: values.item,
      method: values.method
    });
    this.handleHide();
  }

  handleHide() {
    this.setState({
      open: false
    });
    this.props.onHide();
  }

  render() {
    const {pokemon, validLocation} = this.state;

    return (
      <Modal show={this.props.show} onEnter={this.handleEnter}
        onHide={this.handleHide}>
        <RRForm getDispatch={dispatch => this.dispatch = dispatch}
          onSubmit={this.handleSubmit}>

          <Modal.Header closeButton><h2>Add Pokémon</h2></Modal.Header>

          <Modal.Body>
            <PokeSlot pokemon={pokemon} />
            <PokeSprite pokemon={pokemon} />

            <Row className='row-no-padding'>
              <Col xs={6}>
                <RRFControl model='.species' component='pokemon'
                  label='Pokemon*' placeholder='Bulbasaur' required
                  onChange={species => this.updatePokemon({species})} />
              </Col>
              <Col xs={6}>
                <RRFControl model='.nickname' label='Nickname'
                  placeholder='Bulby' />
              </Col>
            </Row>

            <ControlLabel>Location*</ControlLabel>
            {validLocation ? (
              <em> (No catches here yet)</em>
            ) : (
              <em className='text-danger'> (You already reported this location!)</em>
            )}
            <Row className='row-no-padding'>
              <Col xs={6}>
                <RRFControl model='.method' componentClass='select'>
                  <option value='Received at:'>Received at:</option>
                  <option value='Caught at:'>Caught at:</option>
                </RRFControl>
              </Col>
              <Col xs={6}>
                <RRFControl model='.location' placeholder='Pallet Town'
                  onChange={this.checkLocation} required />
              </Col>
            </Row>

            <Button onClick={() => this.setState(({open}) => ({open: !open}))}
              block>
              More Details
            </Button>
            <Panel collapsible expanded={this.state.open} className='no-margin'>
              <Row>
                <Col sm={6} xs={12}>
                <RRFControl model='.level' type='number' label='Level'
                  placeholder='1-100'
                  onChange={level => this.updatePokemon({level})} />
                </Col>
                <Col sm={4} xs={7}>
                  <RRFControl model='.gender' component='toggle' type='radio'
                    label='Gender'
                    onChange={gender => this.updatePokemon({gender})}>
                    <img src={male} value='M' />
                    <img src={female} value='F' />
                    <span value='N'>N/A</span>
                  </RRFControl>
                </Col>
                <Col xs={2}>
                  <RRFControl model='.shiny' component='check'
                    onChange={shiny => this.updatePokemon({shiny})}>
                    Shiny
                  </RRFControl>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <RRFControl model='.form' component='forms' label='Form'
                    placeholder='Normal' pokemon={this.state.pokemon}
                    onChange={form => this.updatePokemon({form})} />
                  <RRFControl model='.nature' component='combobox'
                    label='Nature' placeholder='Adamant'>
                    {natures}
                  </RRFControl>
                  <RRFControl model='.ability' component='combobox'
                    label='Ability' placeholder='Overgrow'>
                    {abilities}
                  </RRFControl>
                </Col>
                <Col xs={6}>
                  <RRFControl model='.moves' component='moves' label='Moves' />
                </Col>
              </Row>

              <RRFControl model='.item' label='Item' placeholder='Oran Berry' />

            </Panel>
          </Modal.Body>
          <Modal.Footer>
            <Button type='submit' bsStyle='success' bsSize='large' block>
              Add Pokémon
            </Button>
          </Modal.Footer>
        </RRForm>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    location: state.location,
    pokemon: state.pokemon
  }
};

const mapDispatchToProps = dispatch => {
  return {
    onAddPokemon: (pokemon) => {
      dispatch(addPokemon(pokemon))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);