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

  // -------- props --------
  export let data = [];
  export let columns = [];
  export let settings = {};
  let __ = {
    ...{
      hiddenColumns: [],
      rowsPerPage: 30,
      pageNow: 0,
      sortedBy: '',
      sortOrder: 1,
      startFilteringDebounceMs: 50,
      debugFilterLog: false,
    },
    ...settings,
  };
  // -----------------------
  const columnLen = columns.length;
  const debounce = createDebounceFn(__.startFilteringDebounceMs);

  $: columnsShown = Object.entries(columns)
    .map(([index, name]) => [Number(index), name])
    .filter(([index]) => !__.hiddenColumns.includes(index));

  let filter = {
    state: columns.map(() => FILTER_ENUM.NULL),
    rawValueByColumnIdx: new Array(columnLen).fill(null),
    expFnByColumnIdx: new Array(columnLen).fill(null),
  };
  let filterInputBindValues = new Array(columnLen).fill(null);

  let cache = saveLoadSettingsCache({ data, columns, filter, settings: __, filterInputBindValues });
  data = cache.data;
  columns = cache.columns;
  __ = cache.settings;
  filter = cache.filter;
  filterInputBindValues = cache.filterInputBindValues;
  cache = undefined;

  const saveColumnSettings = () => {
    localStorage.setItem('table.settings', JSON.stringify(__));
  };
  const saveSortSettings = () => {
    localStorage.setItem('table.settings', JSON.stringify(__));
  };
  const saveFilterSettings = () => {
    localStorage.setItem('table.filter', JSON.stringify(filter));
    localStorage.setItem('table.filterInputBindValues', JSON.stringify(filterInputBindValues));
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

  $: sortedByIndex = columns.indexOf(__.sortedBy);

  $: counts = {
    rowsAll: data.length,
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

  $: rows = data
    .filter((doc) => fnFilteringDoc(doc))
    .sort((docA, docB) => (!__.sortedBy ? 0 : compareAB(docA[sortedByIndex], docB[sortedByIndex]) * __.sortOrder));

  $: filteredCount = rows.length;

  $: rowsPage = rows
    .slice(counts.rows.currentStart, counts.rows.currentEnd)
    .map((doc) =>
      doc
        .map((val, i) => highlightQueryInFiltered(filter.rawValueByColumnIdx[i], val))
        .filter((v, index) => !__.hiddenColumns.includes(index))
    );

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
        __.sortedBy = '';
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

  const changeSortSettingsHandler = (columnName) => {
    if (__.sortedBy === columnName) {
      __.sortOrder *= -1;
    } else {
      __.sortOrder = 1;
    }
    __.sortedBy = columnName;
    __.pageNow = 0;
    saveSortSettings();
  };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  />
</svelte:head>

<div class="component-table__container">
  <ColumnsHideList {columns} hiddenColumns={__.hiddenColumns} {handlers} />

  <table class="component-table">
    <thead>
      <TableCountsContainer {counts} bind:pageNow={__.pageNow} />
      <FilterContainer
        {columnsShown}
        stateFilter={filter.state}
        {FILTER_ENUM}
        {handleFilterTyping}
        bind:filterInputBindValues
      />
      <TableColumnHeader {columnsShown} {changeSortSettingsHandler} sortedBy={__.sortedBy} sortOrder={__.sortOrder} />
    </thead>
    <tbody>
      {#each rowsPage as row}
        <tr>
          {#each row as cell}
            <td>{@html cell}</td>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue',
      sans-serif;
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
  @keyframes -global-opactity-during-loading-font {
    0% {
      opacity: 0.4;
      color: rgba(0, 0, 0, 0.01);
    }
    40% {
      opacity: 0.4;
      color: rgba(0, 0, 0, 0.01);
    }
    100% {
      opacity: 1;
    }
  }

  .component-table__container {
    margin: 0 15px;
    font-family: monospace;
    /* font-family: 'Roboto Mono', monospace; */
    font-size: 18px;
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
    user-select: none;
    /* text-align: center; */
  }
  .component-table td {
    user-select: text;

    padding-left: 15px;
    padding-right: 10px;
    /* for min-width hack */
    /* width: 86px; */
    width: 130px;
  }
  :global(.component-table mark) {
    background-color: hsl(120deg 93% 88%);
  }
  .component-table tbody tr:nth-child(odd) {
    background-color: hsl(0, 0%, 97%);
  }
  .component-table tbody tr:hover {
    background-color: hsl(120deg 93% 88%);
  }
</style>
