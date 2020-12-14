import React from 'react';
import SearchOverlay from "./SearchOverlay";
import { getOverrideSearchExecution } from "helpers/search";
import searchTextFullFactory from '../../apis/searchTextFull';
import core from "core";

// exported so that we can test these internal functions
export function executeSearch(searchValue, options = {}) {
  const searchOptions = {
    regex: false,
    ...options,
  };
  if (searchValue) {
    // user can override search execution with instance.overrideSearchExecution()
    // Here we check if user has done that and call that rather than default search execution
    const overrideSearchExecution = getOverrideSearchExecution();
    if (overrideSearchExecution) {
      overrideSearchExecution(searchValue, searchOptions);
    } else {
      const searchTextFull = searchTextFullFactory();
      searchTextFull(searchValue, searchOptions);
    }
  }
}

export function selectNextResult(searchResults = [], activeResultIndex) {
  if (searchResults.length > 0) {
    const nextResultIndex = activeResultIndex === searchResults.length - 1 ? 0 : activeResultIndex + 1;
    core.setActiveSearchResult(searchResults[nextResultIndex]);
  }
}

export function selectPreviousResult(searchResults = [], activeResultIndex) {
  if (searchResults.length > 0) {
    const prevResultIndex = activeResultIndex <= 0 ? searchResults.length - 1 : activeResultIndex - 1;
    core.setActiveSearchResult(searchResults[prevResultIndex]);
  }
}

function SearchOverlayContainer(props) {
  return (
    <SearchOverlay
      executeSearch={executeSearch}
      selectNextResult={selectNextResult}
      selectPreviousResult={selectPreviousResult}
      {...props}
    />
  );
}

export default SearchOverlayContainer;
