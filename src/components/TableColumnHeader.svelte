<script>
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { onMount } from 'svelte';
  import { iconSymbols } from '../utils/symbols.js';

  const iconSymbolsByOrder = {
    1: iconSymbols.sort.asc,
    '-1': iconSymbols.sort.desc,
  };

  export let columnsShown = {};
  export let changeSortSettingsHandler;
  export let sortedBy = '';
  export let sortOrder = 1;
  let isFirst = true;
  onMount(() => {
    setTimeout(() => {
      isFirst = false;
    }, 200);
  });
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
    animation: opactity-during-loading-font 1s;
  }
  .table-columns-header {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    font-size: 19px;
  }
</style>
