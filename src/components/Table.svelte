<script>
  import { compareAB, createDebounceFn } from '../utils/utils.js';
  import ColumnsHideList from './ColumnsHideList.svelte';
  import TableCountsContainer from './TableCountsContainer.svelte';
  import FilterContainer from './FilterContainer.svelte';
  import TableColumnHeader from './TableColumnHeader.svelte';

  import {
    iconSymbols as icons,
    getExpressionCheckFn,
    isExpression,
    parseExpression,
    isEmptyExpression,
    isValidExpression,
    animateFilterBadExpression,
    highlightQueryInFiltered,
    FILTER_ENUM,
    saveLoadSettingsCache,
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
  const debounce = createDebounceFn(__.startFilteringDebounceMs);

  $: columnsShown = Object.entries(columns)
    .map(([index, name]) => [Number(index), name])
    .filter(([index]) => !__.hiddenColumns.includes(index));

  let filter = {
    state: columns.map(() => FILTER_ENUM.NULL),
    bindValues: new Array(columns.length).fill(null),
    rawValueByColumnIdx: new Array(columns.length).fill(null),
    expFnByColumnIdx: new Array(columns.length).fill(null),
  };

  let cache = saveLoadSettingsCache({ data, columns, filter, settings: __ });
  data = cache.data;
  columns = cache.columns;
  __ = cache.settings;
  filter = cache.filter;
  cache = undefined;

  const saveColumnSettings = () => {
    localStorage.setItem('table.settings', JSON.stringify(__));
  };
  const saveSortSettings = () => {
    localStorage.setItem('table.settings', JSON.stringify(__));
  };
  const saveFilterSettings = () => {
    localStorage.setItem('table.filter', JSON.stringify(filter));
  };

  const updateFilter = () => {
    if (__.debugFilterLog) {
      console.log(filter.state);
    }
    filter.rawValueByColumnIdx = filter.rawValueByColumnIdx;
    filter.expFnByColumnIdx = filter.expFnByColumnIdx;
    filter.bindValues = filter.bindValues;
    filter.state = filter.state;

    saveFilterSettings();
  };
  const resetColumnFilter = (colIdx) => {
    filter.rawValueByColumnIdx[colIdx] = null;
    filter.expFnByColumnIdx[colIdx] = null;
    filter.bindValues[colIdx] = '';
    filter.state[colIdx] = FILTER_ENUM.NULL;

    updateFilter();
  };

  const handleFilterChange = (colIdx, elem) => {
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

      updateFilter();
      return;
    }

    filter.state[colIdx] = FILTER_ENUM.EXPRESSION;
    filter.rawValueByColumnIdx[colIdx] = newValue.replace(/\s/g, '');

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

    if (filter.state[colIdx] === FILTER_ENUM.INVALID_EXPRESSION) {
      animateFilterBadExpression(elem);
    }
    updateFilter();
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
          return filterExpFn(Number(doc[colIdx]));
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
      filter.bindValues[columnIndex] = currentTarget.value;
      filter.bindValues = filter.bindValues;
      __.pageNow = 0; // reset selected page, when change filter

      debounce(() => handleFilterChange(columnIndex, currentTarget));
    };
</script>

<svelte:head>
  <link rel="stylesheet" href="./static/Material_Symbols_Outlined.css" />
  <!-- <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  /> -->
</svelte:head>

<div class="component-table__container">
  <ColumnsHideList {columns} hiddenColumns={__.hiddenColumns} {handlers} icons={icons.column} />

  <table class="component-table">
    <thead>
      <TableCountsContainer {counts} bind:pageNow={__.pageNow} icons={icons.page} />
      <FilterContainer
        {columnsShown}
        stateFilter={filter.state}
        {FILTER_ENUM}
        bind:filterBindValues={filter.bindValues}
        {handleFilterTyping}
      />
      <TableColumnHeader
        {saveSortSettings}
        {columnsShown}
        bind:pageNow={__.pageNow}
        bind:sortedBy={__.sortedBy}
        bind:sortOrder={__.sortOrder}
      />
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
  @keyframes -global-opactity-during-loading-font {
    0% {
      opacity: 0.4;
      color: rgba(0, 0, 0, 0.01);
    }
    30% {
      opacity: 0.6;
      /* color: rgba(0, 0, 0, 0.4); */
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
