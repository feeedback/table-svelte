<script>
  import { iconSymbols } from '../utils/symbols.js';

  const iconSymbolsByOrder = {
    1: iconSymbols.sort.asc,
    '-1': iconSymbols.sort.desc,
  };

  export let columnsShown = {};
  export let changeSortSettingsHandler;
  export let columnsThSmall = [];
  export let sortedBy = '';
  export let sortOrder = 1;
</script>

<tr class="table-columns-header__row">
  {#each columnsShown as [columnIndex, columnName]}
    <th
      on:click={() => changeSortSettingsHandler(columnName)}
      class="table-columns-header__cell"
      class:th-small={columnsThSmall.includes(columnIndex)}
    >
      <span class="table-columns-header"
        ><span>{columnsThSmall.includes(columnIndex) ? columnName.split(/\.?(?=[A-Z])/).join(' ') : columnName}</span>
        {#if sortedBy === columnName}
          <span class="table-columns-header__icon-sort material-symbols-outlined">{@html iconSymbolsByOrder[sortOrder]}</span>
        {/if}</span
      >
    </th>
  {/each}
</tr>

<style>
  .table-columns-header__cell {
    user-select: none;
    cursor: pointer;
    /* padding: 0.5em 0; */
    padding: 0;
    /* padding-right: 0.8em; */
  }
  .table-columns-header__icon-sort {
    margin-left: 2px;
    margin-right: 2px;
    vertical-align: bottom;
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
  .table-columns-header {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    /* font-size: 19px; */
    font-size: 16px;
  }

  .table-columns-header__cell.th-small {
    white-space: break-spaces;
    font-size: 14px;
    /* flex-wrap: wrap; */
  }
</style>
