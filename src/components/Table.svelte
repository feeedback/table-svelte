<script>
  import { compareAB, createDebounceFn } from '../utils/utils.js';
  import ColumnsHideList from './ColumnsHideList.svelte';
  import TableCountsContainer from './TableCountsContainer.svelte';
  import FilterContainer from './FilterContainer.svelte';
  import TableColumnHeader from './TableColumnHeader.svelte';

  import {
    getExpressionCheckFn,
    isExpression,
    parseExpression,
    isEmptyExpression,
    isValidExpression,
    highlightQueryInFiltered,
    FILTER_ENUM,
    saveLoadSettingsCache,
    CHAR_STARS_WITH,
  } from '../utils/table-utils.js';

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function clickOnTrHandler({ type: eventType = 'click', target: eventTarget, ctrlKey, shiftKey, metaKey }, data) {
    dispatch('message', {
      message: 'TABLE_EVENT',
      eventType,
      eventTarget,
      data,
      keys: { ctrlKey, shiftKey, metaKey },
    });
  }

  // -------- props --------
  export let rowsData = [];
  export let columns = [];
  export let settings = {};
  export let ImageComponent;
  // -------- props --------
  // let isTdWrapHover = false;
  // вынес потому как, если хранить в объекте, то при смене страницы - пересчитывается сортировка
  let sortedBy = '';
  let sortOrder = 1;

  let __ = {
    ...{
      hiddenColumns: [],
      rowsPerPage: 30,
      pageNow: 0,
      startFilteringDebounceMs: Math.max(0, Math.round(rowsData.length ** (1 / 2.7) / 2)),
      debugFilterLog: false,
      columnsIdxIsWrap: [],
      columnsThSmall: [],
      isUseCache: true,
    },
    ...settings,
  };
  export let rowsIdxHighlight = [];
  export let rowsHighlightField = 'id';
  export let isSelectText = true;
  export let isHighlight = true;
  export let isTdWrapSmall = false;
  export let cachePrefix = 'table';

  // -----------------------
  const columnLen = columns.length;
  const debounce = createDebounceFn(__.startFilteringDebounceMs);

  $: columnsShown = Object.entries(columns)
    .map(([index, name]) => [Number(index), name])
    .filter(([index]) => !__.hiddenColumns.includes(index));

  $: rowsHighlightQueryFieldIndex = columns.indexOf(rowsHighlightField);

  let filter = {
    state: columns.map(() => FILTER_ENUM.NULL),
    rawValueByColumnIdx: new Array(columnLen).fill(null),
    expFnByColumnIdx: new Array(columnLen).fill(null),
  };
  let filterInputBindValues = new Array(columnLen).fill(null);

  if (__.isUseCache) {
    let cache = saveLoadSettingsCache(
      {
        columns,
        hiddenColumns: __.hiddenColumns,
        sortedBy,
        sortOrder,
        filter,
        filterInputBindValues,
      },
      cachePrefix
    );
    __.hiddenColumns = cache.hiddenColumns;
    sortedBy = cache.sort.sortedBy;
    sortOrder = cache.sort.sortOrder;

    filter = cache.filter;
    filterInputBindValues = cache.filterInputBindValues;
    cache = undefined;
  }

  const saveColumnSettings = () => {
    if (__.isUseCache) {
      localStorage.setItem(cachePrefix + '.hiddenColumns', JSON.stringify(__.hiddenColumns));
    }
  };
  const saveSortSettings = () => {
    if (__.isUseCache) {
      localStorage.setItem(cachePrefix + '.sort', JSON.stringify({ sortedBy, sortOrder }));
    }
  };
  const saveFilterSettings = () => {
    if (__.isUseCache) {
      localStorage.setItem(cachePrefix + '.filter', JSON.stringify(filter));
      localStorage.setItem(cachePrefix + '.filterInputBindValues', JSON.stringify(filterInputBindValues));
    }
  };

  const resetColumnFilter = (colIdx) => {
    filterInputBindValues[colIdx] = '';

    filter.rawValueByColumnIdx[colIdx] = null;
    filter.expFnByColumnIdx[colIdx] = null;
    filter.state[colIdx] = FILTER_ENUM.NULL;

    saveFilterSettings();
  };

  const handleFilterChange = (colIdx, elem) => {
    filterInputBindValues[colIdx] = elem.value;
    __.pageNow = 0; // reset selected page, when change filter

    const newValue = elem.value.trim();

    if (newValue === '') {
      filter.state[colIdx] = FILTER_ENUM.NULL;
      resetColumnFilter(colIdx);
      return;
    }

    const isThisExpression = isExpression(newValue);

    if (!isThisExpression) {
      filter.state[colIdx] = FILTER_ENUM.STRING;
      filter.rawValueByColumnIdx[colIdx] = newValue;
      filter.expFnByColumnIdx[colIdx] = null;

      saveFilterSettings();
      return;
    }

    filter.state[colIdx] = FILTER_ENUM.EXPRESSION;
    filter.rawValueByColumnIdx[colIdx] = newValue;

    if (isEmptyExpression(newValue)) {
      filter.state[colIdx] = FILTER_ENUM.EMPTY_EXPRESSION;
      //
    } else if (isValidExpression(newValue)) {
      filter.state[colIdx] = FILTER_ENUM.VALID_EXPRESSION;
      filter.expFnByColumnIdx[colIdx] = getExpressionCheckFn(parseExpression(newValue));
      //
    } else {
      filter.state[colIdx] = FILTER_ENUM.INVALID_EXPRESSION;
    }

    saveFilterSettings();
  };

  $: sortedByIndex = columns.indexOf(sortedBy);
  $: imgColumnIndex = columns.indexOf('img');

  $: counts = {
    rowsAll: rowsData.length,
    columnsShown: columnsShown.length,

    page: {
      current: Math.min(__.pageNow + 1, Math.ceil(filteredCount / __.rowsPerPage)),
      total: Math.ceil(filteredCount / __.rowsPerPage),
    },
    rows: {
      currentStart: __.pageNow * __.rowsPerPage,
      currentEnd: Math.min((__.pageNow + 1) * __.rowsPerPage, filteredCount),
      filtered: filteredCount,
    },
  };

  $: fnFilteringDoc = (doc) =>
    Object.entries(filter.rawValueByColumnIdx)
      .filter(([k, v]) => v !== null)
      .every(([colIdx, filterValue]) => {
        if (filter.state[colIdx] === FILTER_ENUM.EMPTY_EXPRESSION) {
          return true;
        }

        const filterExpFn = filter.expFnByColumnIdx[colIdx];
        if (filterExpFn) {
          return filterExpFn(doc[colIdx]);
        }
        if (filterValue[0] === CHAR_STARS_WITH) {
          return String(doc[colIdx]).toLowerCase().indexOf(filterValue.slice(1).toLowerCase()) === 0;
        }
        return String(doc[colIdx]).toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
      });

  $: filterMy = (arr) => arr.filter((doc) => fnFilteringDoc(doc));
  $: sortMy = (arr) => {
    arr.sort((docA, docB) => (!sortedBy ? 0 : compareAB(docA[sortedByIndex], docB[sortedByIndex]) * sortOrder));
    return arr;
  };

  $: rows = sortMy(filterMy(rowsData));

  $: filteredCount = rows.length;

  $: rowsPage = rows
    .slice(counts.rows.currentStart, counts.rows.currentEnd)
    .map((doc) => doc.map((val, i) => highlightQueryInFiltered(filter.rawValueByColumnIdx[i], val)));

  const handlers = {
    showColumn: (columnIndex) => {
      __.hiddenColumns.splice(__.hiddenColumns.indexOf(columnIndex), 1);
      __.hiddenColumns = __.hiddenColumns;
      saveColumnSettings();
    },
    hideColumn: (columnIndex) => {
      resetColumnFilter(columnIndex); // reset filter by this column

      if (sortedByIndex === columnIndex) {
        // reset sort by this column
        sortedBy = '';
      }

      __.hiddenColumns.push(columnIndex); // hide column
      __.hiddenColumns = __.hiddenColumns;
      saveColumnSettings();
    },
  };

  const handleFilterTyping =
    (columnIndex) =>
    ({ currentTarget }) => {
      debounce(() => handleFilterChange(columnIndex, currentTarget));
    };

  const _changeSortSettingsHandler = (columnName) => {
    if (sortedBy === columnName) {
      sortOrder *= -1;
    } else {
      sortOrder = 1;
    }
    sortedBy = columnName;
    __.pageNow = 0;
    saveSortSettings();
  };
  const changeSortSettingsHandler = (columnName) => debounce(() => _changeSortSettingsHandler(columnName));

  const getRowObj = (data) => {
    const objItem = {};
    columns.forEach((col, i) => {
      objItem[col] = data[i];
    });
    return objItem;
  };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&family=Roboto+Mono&display=swap" rel="stylesheet" />
</svelte:head>

<div class="component-table__container" id="component-table">
  <ColumnsHideList {columns} hiddenColumns={__.hiddenColumns} {handlers} />

  <table class="component-table" class:no-select-text={!isSelectText}>
    <thead>
      <TableCountsContainer {counts} bind:pageNow={__.pageNow} />
      <FilterContainer {columnsShown} stateFilter={filter.state} {FILTER_ENUM} {handleFilterTyping} bind:filterInputBindValues />
      <TableColumnHeader {columnsShown} {changeSortSettingsHandler} {sortedBy} {sortOrder} columnsThSmall={__.columnsThSmall} />
    </thead>
    <tbody>
      {#each rowsPage as row}
        <tr
          on:dblclick={(event) => clickOnTrHandler(event, row)}
          on:dragstart={(event) => clickOnTrHandler(event, row)}
          on:touchmove={(event) => clickOnTrHandler(event, row)}
          class:tr-highlight={isHighlight && rowsIdxHighlight.includes(row[rowsHighlightQueryFieldIndex])}
          class:td-wrap-small={isTdWrapSmall}
        >
          {#each row as cell, index}
            {#if !__.hiddenColumns.includes(index)}
              {#if index === imgColumnIndex}
                <td> <svelte:component this={ImageComponent} img={row[imgColumnIndex]} rowObj={getRowObj(row)} /></td>
              {:else}
                <td class:td-wrap={__.columnsIdxIsWrap.includes(index)}>
                  <span class="td-content" class:td-content-wrap={__.columnsIdxIsWrap.includes(index)}>{@html cell}</span>
                </td>
              {/if}
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  :global(html, body) {
    position: relative;
    width: 100%;
    height: 100%;
    /* background-color: rgb(26, 26, 26); */
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    color: #333;
    margin: 0;
    padding: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  :global(input, button, select, textarea) {
    font-family: inherit;
    font-size: inherit;
    padding: 0.2em;
    margin: 0 0 0.5em 0;
    border: 1px solid #ccc;
    border-radius: 2px;
  }

  :global(button) {
    color: #333;
    background-color: #f6f6f6;
  }

  :global(.material-symbols-outlined) {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: 'liga';
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }

  .component-table__container {
    margin: 0 15px;
    font-family: monospace;
    font-size: 14px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 8px;
    width: calc(100% - 30px - 6%);
    overflow-y: hidden;
    overflow-x: auto;
  }
  .component-table__container > * {
    margin-left: auto;
    margin-right: auto;
  }
  .component-table {
    /* table-layout: auto; */
    table-layout: fixed;
    border-collapse: collapse;
    /* width: 80%; */
    white-space: nowrap;
    /* user-select: none; */
    /* text-align: center; */
  }
  .component-table.no-select-text tr {
    user-select: none;
    cursor: pointer;
  }

  .component-table td {
    /* user-select: text; */

    padding-left: 15px;
    padding-right: 10px;
    /* for min-width hack */
    /* width: 86px; */
    width: 80px;
  }
  .component-table td {
    max-width: 240px;
  }
  .component-table td:first-child {
    font-weight: bold;
    max-width: 300px;
  }
  .component-table .td-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;

    font-family: 'Roboto Mono', monospace;
  }
  .component-table .td-content-wrap {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: inherit;
  }

  .component-table .td-wrap {
    white-space: break-spaces;
    width: max-content !important;
    word-break: break-all;
    min-width: 220px;
    max-width: 480px !important;
    -webkit-line-clamp: inherit;
  }

  :global(.component-table mark) {
    background-color: hsl(60deg 93% 88%);
  }
  .component-table tbody tr:nth-child(odd) {
    background-color: hsl(0, 0%, 97%);
  }
  .component-table tbody tr:hover {
    background-color: hsl(120deg 99% 93%);
  }
  .component-table tbody tr.td-wrap-small:hover {
    -webkit-line-clamp: 50;
    border: 2px outset rgba(169, 161, 255, 0.3);
  }
  .component-table tbody tr {
    -webkit-line-clamp: 30;
    border-bottom: 1px #ffffff solid;
  }
  :global(.component-table tbody tr summary) {
    user-select: none;
    cursor: pointer;
  }
  :global(.component-table tbody tr details) {
    display: inline-block;
    margin-top: 6px;
    margin-bottom: 4px;
  }
  .component-table tr.td-wrap-small {
    -webkit-line-clamp: 1;
  }

  .component-table tbody tr.tr-highlight {
    background-color: hsl(200deg 99% 95%);
  }
</style>
