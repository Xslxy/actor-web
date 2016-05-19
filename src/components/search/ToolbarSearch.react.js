/*
 * Copyright (C) 2015 Actor LLC. <https://actor.im>
 */

import React, { Component, PropTypes } from 'react';
import { Container } from 'flux/utils';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import history from '../../utils/history';

import SearchStore from '../../stores/SearchStore';

import SearchActionCreators from '../../actions/SearchActionCreators';
import ComposeActionCreators from '../../actions/ComposeActionCreators';
import DialogActionCreators from '../../actions/DialogActionCreators';

import SearchInput from './SearchInput.react';
import ContactItem from '../common/ContactItem.react';

class ToolbarSearch extends Component {
  static propTypes = {
    className: PropTypes.string
  }

  static getStores() {
    return [SearchStore];
  }

  static calculateState(prevState) {
    const searchState = SearchStore.getState();

    return {
      ...prevState,
      query: searchState.query,
      results: searchState.results,
      isSearchExpanded: prevState ? prevState.isSearchExpanded : true,
      isSearchFocused: prevState ? prevState.isSearchFocused : false,
      isResultsDropdownOpen: prevState ? prevState.isResultsDropdownOpen : false
    }
  }

  constructor(props) {
    super(props);

    this.handleToolbarSearchClick = this.handleToolbarSearchClick.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchToggleFocus = this.handleSearchToggleFocus.bind(this);
    this.handleMessagesSearch = this.handleMessagesSearch.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
  }

  handleSearchChange(query) {
    SearchActionCreators.handleSearch(query);
  }

  handleSearchToggleFocus(isFocused) {
    console.debug('handleSearchToggleFocus', isFocused);
    ComposeActionCreators.toggleAutoFocus(!isFocused);
    this.setState({
      isSearchFocused: isFocused
    });

    if (isFocused) {
      this.setState({ isResultsDropdownOpen: true })
    }
  }

  handleToolbarSearchClick() {
    console.debug('handleToolbarSearchClick');
    this.setState({ isSearchExpanded: true });
  }

  handleMessagesSearch() {
    console.debug('handleMessagesSearch')
    this.setState({ isResultsDropdownOpen: false })
  }

  handleResultClick(peer) {
    console.debug('handleResultClick', peer)
    this.setState({ isResultsDropdownOpen: false });
    this.handleSearchChange('');
    history.push(`/im/${peer.key}`);
  }

  renderSearchInput() {
    const { query, isSearchExpanded } = this.state;

    if (!isSearchExpanded) {
      return null;
    }

    return (
      <SearchInput
        className="toolbar__search__input col-xs"
        value={query}
        onChange={this.handleSearchChange}
        onToggleFocus={this.handleSearchToggleFocus}
      />
    );
  }

  renderSearchGroupResults() {
    const { results: { groups } } = this.state;

    if (!groups.length) {
      return null;
    }

    const groupResults = groups.map((group, index) => {
      return (
        <ContactItem
          key={`g.${index}`}
          onClick={() => this.handleResultClick(group.peerInfo.peer)}
          uid={group.peerInfo.peer.id}
          name={group.peerInfo.title}
          placeholder={group.peerInfo.placeholder}
          avatar={group.peerInfo.avatar}
        />
      );
    });

    return (
      <div>
        <header>Groups</header>
        {groupResults}
      </div>
    );
  }

  renderSearchContactResults() {
    const { results: { contacts } } = this.state;

    if (!contacts.length) {
      return null;
    }

    const contactsResults = contacts.map((contact, index) => {
      return (
        <ContactItem
          key={`c.${index}`}
          onClick={() => this.handleResultClick(contact.peerInfo.peer)}
          uid={contact.peerInfo.peer.id}
          name={contact.peerInfo.title}
          placeholder={contact.peerInfo.placeholder}
          avatar={contact.peerInfo.avatar}
        />
      );
    });

    return (
      <div>
        <header>Contacts</header>
        {contactsResults}
      </div>
    );
  }

  renderSearchResultsDropdown() {
    const { query, isResultsDropdownOpen, isSearchFocused } = this.state;

    // if (!query || query === '' || !isSearchFocused) {
    if (!query || query === '' || !isResultsDropdownOpen) {
    // if (!query || query === '') {
      return null;
    }

    return (
      <div className="toolbar__search__dropdown">
        <div className="toolbar__search__results">
          {this.renderSearchContactResults()}
          {this.renderSearchGroupResults()}
        </div>
        <footer>
          <a onClick={this.handleMessagesSearch}>Search messages in current dialog ></a>
        </footer>
      </div>
    );
  }

  render() {
    const { className } = this.props;
    const { isSearchExpanded, isSearchFocused } = this.state;

    const toolbarSearchClassName = classnames('toolbar__search row', className, {
      'toolbar__search--expanded': isSearchExpanded,
      'toolbar__search--focused': isSearchFocused
    });

    return (
      <div className={toolbarSearchClassName} onClick={this.handleToolbarSearchClick}>
        <div className="row">
          <i className="search-icon material-icons">search</i>
          {this.renderSearchInput()}
        </div>
        {this.renderSearchResultsDropdown()}
      </div>
    );
  }
}

export default Container.create(ToolbarSearch);