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
  } from '../utils/table-utils.js';

  // -------- props --------
  export let data = [];
  export let columns = [];
  export let settings = {};
  const __ = {
    ...{
      hiddenColumns: new Set([]),
      rowsPerPage: 30,
      sortedBy: '',
      startFilteringDebounceMs: 50,
      pageNow: 0,
      sortOrder: 1,
      debugFilterLog: false,
    },
    ...settings,
  };
  // -----------------------

  let cachedData = localStorage.getItem('tableData');
  if (!cachedData) {
    localStorage.setItem('tableData', JSON.stringify(data));
  } else {
    data = JSON.parse(cachedData);
  }
  cachedData = undefined;

  const debounce = createDebounceFn(__.startFilteringDebounceMs);

  const FILTER_ENUM = {
    NULL: 'NULL',

    STRING: 'STRING',

    EXPRESSION: 'EXPRESSION',
    EMPTY_EXPRESSION: 'EMPTY_EXPRESSION',
    VALID_EXPRESSION: 'VALID_EXPRESSION',
    INVALID_EXPRESSION: 'INVALID_EXPRESSION',
  };

  $: stateFilter = columns.map(() => FILTER_ENUM.NULL);

  $: columnsShown = Object.entries(columns)
    .map(([index, name]) => [Number(index), name])
    .filter(([index]) => !__.hiddenColumns.has(index));

  let filterBindValues = [];
  let filtersRawValueByColIdx = [];
  let filtersExpFnByColIdx = [];

  const updateFilter = () => {
    if (__.debugFilterLog) {
      console.log(stateFilter);
    }

    filtersRawValueByColIdx = filtersRawValueByColIdx;
    filtersExpFnByColIdx = filtersExpFnByColIdx;
    filterBindValues = filterBindValues;
  };
  const resetColumnFilter = (colIdx) => {
    filtersRawValueByColIdx[colIdx] = null;
    filtersExpFnByColIdx[colIdx] = null;
    filterBindValues[colIdx] = '';

    updateFilter();
  };

  const handleFilterChange = (colIdx, elem) => {
    const newValue = elem.value.trim();

    if (newValue === '') {
      stateFilter[colIdx] = FILTER_ENUM.NULL;
      resetColumnFilter(colIdx);
      return;
    }

    const isThisExpression = isExpression(newValue);

    if (!isThisExpression) {
      stateFilter[colIdx] = FILTER_ENUM.STRING;
      filtersRawValueByColIdx[colIdx] = newValue;
      filtersExpFnByColIdx[colIdx] = null;

      updateFilter();
      return;
    }

    stateFilter[colIdx] = FILTER_ENUM.EXPRESSION;
    filtersRawValueByColIdx[colIdx] = newValue.replace(/\s/g, '');

    if (isEmptyExpression(newValue)) {
      stateFilter[colIdx] = FILTER_ENUM.EMPTY_EXPRESSION;
      //
    } else if (isValidExpression(newValue)) {
      stateFilter[colIdx] = FILTER_ENUM.VALID_EXPRESSION;
      filtersExpFnByColIdx[colIdx] = getExpressionCheckFn(parseExpression(newValue));
      //
    } else {
      stateFilter[colIdx] = FILTER_ENUM.INVALID_EXPRESSION;
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
    Object.entries(filtersRawValueByColIdx)
      .filter(([k, v]) => v !== null)
      .every(([colIdx, filterValue]) => {
        if (stateFilter[colIdx] === FILTER_ENUM.EMPTY_EXPRESSION) {
          return true;
        }

        const filterExpFn = filtersExpFnByColIdx[colIdx];
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
        .map((val, i) => highlightQueryInFiltered(filtersRawValueByColIdx[i], val))
        .filter((v, index) => !__.hiddenColumns.has(index))
    );

  const handlers = {
    showColumn: (columnIndex) => {
      __.hiddenColumns.delete(columnIndex);
      __.hiddenColumns = __.hiddenColumns;
    },
    hideColumn: (columnIndex) => {
      resetColumnFilter(columnIndex); // reset filter by this column

      if (sortedByIndex === columnIndex) {
        // reset sort by this column
        __.sortedBy = '';
      }

      __.hiddenColumns.add(columnIndex); // hide column
      __.hiddenColumns = __.hiddenColumns;
    },
  };

  const handleFilterTyping =
    (columnIndex) =>
    ({ currentTarget }) => {
      filterBindValues[columnIndex] = currentTarget.value;
      __.pageNow = 0; // reset selected page, when change filter

      debounce(() => handleFilterChange(columnIndex, currentTarget));
    };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  />
</svelte:head>

<div class="component-table__container">
  <ColumnsHideList {columns} hiddenColumns={__.hiddenColumns} {handlers} icons={icons.column} />

  <table class="component-table">
    <thead>
      <TableCountsContainer {counts} bind:pageNow={__.pageNow} icons={icons.page} />
      <FilterContainer {columnsShown} {stateFilter} {FILTER_ENUM} bind:filterBindValues {handleFilterTyping} />
      <TableColumnHeader {columnsShown} bind:sortedBy={__.sortedBy} bind:sortOrder={__.sortOrder} />
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
  .component-table__container {
    margin: 0 15px;
    font-family: monospace;
    /* font-family: 'Roboto Mono', monospace; */
    font-size: 18px;
    margin-left: auto;
    margin-right: auto;
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
