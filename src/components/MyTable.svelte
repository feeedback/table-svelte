<script>
  import { compareAB, createDebounceFn } from '../utils/utils.js';
  import {
    THIN_SPACE,
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
      hideColumns: new Set([]),
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

  $: dataCount = data?.length;
  $: viewColumns = columns.filter((col, i) => !__.hideColumns.has(i));
  $: columnsCount = viewColumns.length;

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
        .filter((v, index) => !__.hideColumns.has(index))
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

    // reset sort by this column
    if (sortedByIndex === colIdx) {
      __.sortedBy = '';
    }

    __.hideColumns.add(colIdx); // hide column
    __.hideColumns = __.hideColumns;
  };

  const addColumnHandler = (collIdx) => {
    __.hideColumns.delete(collIdx);
    __.hideColumns = __.hideColumns;
  };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.sandbox.google.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200"
  />
</svelte:head>

<div class="component-table-container">
  <div class="columns-list__box">
    <details>
      <summary class="columns-list__header">Columns</summary>
      <div class="columns-list">
        {#each columns as col, i}
          <div class="columns-list__element">
            <div class="columns-list__name-box" class:columns-list__name_hidden={__.hideColumns.has(i)}>
              <span class="columns-list__name" title={col}>{col}</span>
            </div>
            <div class="columns-list__button-box">
              {#if __.hideColumns.has(i)}
                <button class="add-column-button material-symbols-outlined" on:click={() => addColumnHandler(i)}
                  >{@html icons.addColumn}</button
                >
              {:else}
                <button class="hide-column-button material-symbols-outlined" on:click={() => hideColumnHandler(i)}
                  >{@html icons.removeColumn}</button
                >
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </details>
  </div>
  <table class="component-table">
    <thead>
      <tr>
        <td colspan={columnsCount} class="table-counts-container-td">
          <div class="table-counts-container">
            <div class="table-counts__count-fitered">
              {counts.rows.currentStart}-{counts.rows.currentEnd} of{@html THIN_SPACE}<span
                class="table-counts__count-filtered"
              >
                {counts.rows.filtered}</span
              >
              <span class="table-counts__count-total">({dataCount})</span>
            </div>
            <div class="count-page">
              <button
                class="icon-page material-symbols-outlined"
                disabled={__.pageNow === 0}
                on:click|capture|stopPropagation={() => {
                  __.pageNow = 0;
                }}>{@html icons.pageFirst}</button
              ><button
                class="icon-page material-symbols-outlined"
                disabled={__.pageNow === 0}
                on:click|capture|stopPropagation={() => {
                  __.pageNow -= 1;
                }}>{@html icons.pagePrev}</button
              ><span class="count-page-text"
                >Page: <span class="count-page-text-current">{counts.page.current}</span
                >{@html `${THIN_SPACE}/${THIN_SPACE}`}{counts.page.total}</span
              ><button
                class="icon-page material-symbols-outlined"
                disabled={__.pageNow >= counts.page.total - 1}
                on:click|capture|stopPropagation={() => {
                  __.pageNow += 1;
                }}>{@html icons.pageNext}</button
              ><button
                class="icon-page material-symbols-outlined"
                disabled={__.pageNow >= counts.page.total - 1}
                on:click|capture|stopPropagation={() => {
                  __.pageNow = counts.page.total - 1;
                }}>{@html icons.pageLast}</button
              >
            </div>
          </div>
        </td>
      </tr>
      <tr>
        {#each columns as colName, colI}
          {#if __.hideColumns.has(colI) === false}
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
          {#if __.hideColumns.has(colI) === false}
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

  button:focus {
    border-color: #666;
  }

  .component-table-container {
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

  .component-table-container > * {
    margin-left: auto;
    margin-right: auto;
  }
  .component-table .table-counts-container-td {
    padding: 0;
    min-width: 32em;
  }
  .table-counts-container {
    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: center;
    /* width: 80%; */
    font-size: 17px;
    margin-bottom: 4px;
    /* font-family: 'Roboto'; */
    vertical-align: middle;
    height: 28px;
  }
  .table-counts__count-fitered {
    display: flex;
    align-items: center;
    color: #989898;
  }
  .table-counts__count-total {
    margin-left: 5px;
    color: #aaa;
    font-size: 16px;
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
  .count-page {
    display: flex;
    align-items: center;
    column-gap: 7px;
  }
  .count-page-text {
    width: 8.5em;
    text-align: center;
    color: #989898;
  }
  .count-page-text-current {
    color: #000;
  }
  .table-counts__count-filtered {
    color: #000;
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

  .icon-page {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 40;
    padding: 0;
    margin: 0;
    border: 1px white solid;
    border-radius: 3px;
    background-color: #fbfbfb;
    user-select: none;
    cursor: pointer;
  }
  .icon-page:not([disabled]):hover {
    border-color: rgb(220 220 220);
  }
  .icon-page:not([disabled]):active {
    color: rgb(0, 0, 255);
    background-color: white;
  }
  .table-columns-header > th {
    padding: 0.5em 0;
    /* padding-right: 0.8em; */
  }
  .columns-list__box {
    top: 69px;
    left: 18px;
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    /* width: 15em; */
    background-color: rgba(255, 255, 255, 0.98);
    border: 1px rgba(128, 128, 128, 0.7) dotted;
    border-radius: 4px;
    z-index: 100;
    /* padding: 0.5em 2px; */
    padding: 7px 8px 0.3em 6px;
    box-shadow: 2px 2px 2px 0px rgb(34 60 80 / 10%);
  }
  .columns-list {
    width: 11em;
    overflow: hidden;
    padding-left: 1em;
    padding-right: 0.8em;
    padding-bottom: 0.5em;
    font-size: 19px;
    margin: 0;
    margin-top: 1em;
    font-family: 'Roboto';
  }
  .columns-list > .columns-list__element {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  /* .columns-list > .columns-list__element:not(:last-child) {
    margin-bottom: 4px;
  } */
  .columns-list__header {
    user-select: none;
    cursor: pointer;
    font-weight: bold;
    line-height: initial;
  }

  .columns-list__box .columns-list__element button {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 40;
    text-align: center;
    margin: 0;
    padding: 0;
    background-color: transparent;
    border: 1px rgb(245, 245, 245) dotted;
    border-top: 1px rgb(240, 240, 240) solid;
    border-bottom: 1px rgb(240, 240, 240) solid;
    border-radius: 2px;
    user-select: none;
    cursor: pointer;
  }
  .columns-list__box .columns-list__element:hover button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
    /* border: 1px rgb(230, 230, 230) dotted; */
  }
  .columns-list__box .columns-list__element:hover button.hide-column-button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
  }
  .columns-list__box .columns-list__element button:hover {
    border-style: solid;
    /* border: 1px rgb(220, 220, 220) dotted; */
  }

  .columns-list__box .columns-list__element .hide-column-button {
    /* color: #c85d5d; */
    /* color: #cd5b5b; */
    color: #df5555;
    /* font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol'; */
  }
  .columns-list__box .columns-list__element button.hide-column-button:hover {
    color: rgb(216, 34, 34);
  }
  .columns-list__box .columns-list__element .add-column-button {
    color: rgb(7, 184, 7);
  }
  .columns-list__box .columns-list__element .add-column-button:hover {
    color: rgb(0, 153, 0);
  }

  .columns-list__name-box {
    width: calc(100% - 3px - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .columns-list__name_hidden {
    text-decoration: line-through;
    /* color: #989898; */
    color: #b7b7b7;
    text-decoration-thickness: 1px;
    text-decoration-color: rgba(225, 128, 128, 0.486);
    /* text-decoration-style: double; */
  }
</style>
