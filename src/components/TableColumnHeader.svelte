<script>
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { onMount } from 'svelte';
  import { iconSymbolsByOrder } from '../utils/table-utils.js';

  export let saveSortSettings;
  export let columnsShown = {};
  export let sortedBy = '';
  export let sortOrder = 1;
  export let pageNow;

  let isFirst = true;
  onMount(() => {
    setTimeout(() => {
      isFirst = false;
    }, 200);
  });
  const changeSortSettingsHandler = (columnName) => {
    if (sortedBy === columnName) {
      sortOrder *= -1;
    } else {
      sortOrder = 1;
    }
    sortedBy = columnName;
    pageNow = 0;
    saveSortSettings();
  };
</script>

<tr class="table-columns-header__row">
  {#each columnsShown as [columnIndex, columnName]}
    <th on:click={() => changeSortSettingsHandler(columnName)} class="table-columns-header__cell">
      <span class="table-columns-header"
        ><span>{columnName}</span>
        {#if sortedBy === columnName}
          <span class="table-columns-header__icon-sort material-symbols-outlined" class:animation-loading={isFirst}
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
  .animation-loading {
    animation: opactity-during-loading-font 0.8s;
  }
  .table-columns-header {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    font-size: 19px;
  }
</style>
