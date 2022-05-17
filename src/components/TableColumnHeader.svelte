<script>
  import { iconSymbolsByOrder } from '../utils/table-utils.js';

  export let saveSortSettings;
  export let columnsShown = {};
  export let sortedBy = '';
  export let sortOrder = 1;

  const changeSortSettingsHandler = (columnName) => {
    if (sortedBy === columnName) {
      sortOrder *= -1;
    } else {
      sortOrder = 1;
    }
    sortedBy = columnName;
    saveSortSettings();
  };
</script>

<tr class="table-columns-header__row">
  {#each columnsShown as [columnIndex, columnName]}
    <th on:click={() => changeSortSettingsHandler(columnName)} class="table-columns-header__cell">
      <span class="table-columns-header"
        ><span>{columnName}</span>
        {#if sortedBy === columnName}
          <span class="table-columns-header__icon-sort material-symbols-outlined"
            >{@html iconSymbolsByOrder[sortOrder]}</span
          >
        {/if}</span
      >
    </th>
  {/each}
</tr>

<style>
  .table-columns-header__cell {
    user-select: none;
    cursor: pointer;
    padding: 0.5em 0;
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
  }
</style>
