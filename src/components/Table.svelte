<script>
  import { compareAB, createDebounceFn } from '../utils/utils.js';
  import ColumnsHideList from './ColumnsHideList.svelte';
  import CountsContainer from './CountsContainer.svelte';

  import {
    iconSymbols as icons,
    iconSymbolsByOrder,
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
      startFilteringDebounceMs: 100,
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
  let filtersRawValueByColIdx = [];
  let filtersExpFnByColIdx = [];

  const updateFilter = () => {
    if (__.debugFilterLog) {
      console.log(stateFilter);
    }

    filtersRawValueByColIdx = filtersRawValueByColIdx;
    filtersExpFnByColIdx = filtersExpFnByColIdx;
  };
  const resetColumnFilter = (colIdx) => {
    filtersRawValueByColIdx[colIdx] = null;
    filtersExpFnByColIdx[colIdx] = null;

    updateFilter();
  };

  const handleInputTyping = (colIdx, elem) => {
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
    columnsShown: columns.length - __.hiddenColumns.size,

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

  const changeSortSettingsHandler = (fieldName) => {
    if (__.sortedBy === fieldName) {
      __.sortOrder *= -1;
    } else {
      __.sortOrder = 1;
    }
    __.sortedBy = fieldName;
  };

  const hideColumnHandler = (colIdx) => {
    // reset filter by this column
    resetColumnFilter(colIdx);
    console.log(__.pageNow);
    // reset sort by this column
    if (sortedByIndex === colIdx) {
      __.sortedBy = '';
    }

    __.hiddenColumns.add(colIdx); // hide column
    __.hiddenColumns = __.hiddenColumns;
  };

  const addColumnHandler = (collIdx) => {
    __.hiddenColumns.delete(collIdx);
    __.hiddenColumns = __.hiddenColumns;
  };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  />
</svelte:head>

<div class="component-table__container">
  <ColumnsHideList
    {columns}
    hiddenColumns={__.hiddenColumns}
    handlers={{ hideColumn: hideColumnHandler, addColumn: addColumnHandler }}
    icons={icons.column}
  />
  <table class="component-table">
    <thead>
      <CountsContainer {counts} bind:pageNow={__.pageNow} icons={icons.page} />
      <tr>
        {#each columns as colName, colI}
          {#if __.hiddenColumns.has(colI) === false}
            <th>
              <input
                class="filter-by-column"
                on:input|capture={({ currentTarget }) => {
                  __.pageNow = 0; // reset selected page, when change filter

                  debounce(() => handleInputTyping(colI, currentTarget));
                }}
                class:active-filter={stateFilter[colI] !== FILTER_ENUM.NULL}
                class:active-filter-expression={stateFilter[colI].includes('EXPRESSION')}
                class:bad-expression={stateFilter[colI] === FILTER_ENUM.INVALID_EXPRESSION}
              />
            </th>
          {/if}
        {/each}
      </tr>
      <tr class="table-columns-header">
        {#each columns as colName, colI}
          {#if __.hiddenColumns.has(colI) === false}
            <th on:click={() => changeSortSettingsHandler(colName)}>
              <span class="table-columns-header__element"
                ><span>{colName}</span>
                {#if __.sortedBy === colName}
                  <span class="icon-sort material-symbols-outlined">{@html iconSymbolsByOrder[__.sortOrder]}</span>
                {/if}</span
              >
            </th>
          {/if}
        {/each}
      </tr>
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
  @keyframes shake-little {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70% {
      transform: translateX(-4px);
    }
    20%,
    40%,
    60% {
      transform: translateX(4px);
    }
    80% {
      transform: translateX(2px);
    }
    90% {
      transform: translateX(-2px);
    }
  }
  @keyframes shake-border-color {
    0% {
      border-color: hsl(0deg 54% 82%);
    }
    60% {
      border-color: rgb(212, 89, 89);
    }
    100% {
      border-color: hsl(0deg 54% 82%);
    }
  }

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
  .component-table th {
    user-select: none;
    cursor: pointer;
  }
  .component-table td {
    user-select: text;

    padding-left: 15px;
    padding-right: 10px;
    /* for min-width hack */
    /* width: 86px; */
    width: 130px;
  }

  .component-table input {
    line-height: normal;
  }
  .component-table input.filter-by-column {
    text-align: center;
    border: 2px solid #ddd;
    font-style: italic;
    width: calc(98% - 4px);
  }
  .component-table input.filter-by-column.active-filter {
    border-color: hsl(120deg 35% 73%);
  }
  .component-table input.filter-by-column.active-filter-expression {
    border-color: hsl(201deg 100% 79%);
  }
  .component-table input.filter-by-column.bad-expression {
    border-color: hsl(0deg 54% 82%);
  }
  :global(input.shake) {
    animation: shake-little 0.15s ease-out 0s 1 normal none;
    /* shake-border-color 0.1s ease-out 0s 1 normal none; */
  }
  :global(.component-table mark) {
    background-color: hsl(120deg 93% 88%);
  }
  .component-table input.filter-by-column.bad-expression:focus-visible,
  .component-table input.filter-by-column.active-filter:focus-visible {
    outline: none;
  }

  .component-table tbody tr:nth-child(odd) {
    background-color: hsl(0, 0%, 97%);
  }
  .component-table tbody tr:hover {
    background-color: hsl(120deg 93% 88%);
  }

  .icon-sort {
    margin-left: 2px;
    margin-right: 2px;
    vertical-align: bottom;
    font-size: 20px;
  }
  .table-columns-header__element {
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  .table-columns-header > th {
    padding: 0.5em 0;
    /* padding-right: 0.8em; */
  }
</style>
