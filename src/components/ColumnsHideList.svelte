<script>
  import ColumnsHideListElement from './ColumnsHideListElement.svelte';

  export let columns = [];
  export let hiddenColumns = [];
  export let handlers = {};
</script>

<div class="columns-hide-list__container">
  <details>
    <summary class="columns-hide-list__header">Columns</summary>
    <div class="columns-hide-list__list">
      {#each columns as columnName, columnIndex}
        <ColumnsHideListElement {hiddenColumns} {columnName} {columnIndex} {handlers} />
      {/each}
    </div>
  </details>
</div>

<style>
  .columns-hide-list__container {
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
  .columns-hide-list__header {
    user-select: none;
    cursor: pointer;
    font-weight: bold;
    line-height: initial;
    font-size: 16px;
  }

  .columns-hide-list__list {
    width: 16em;
    overflow: hidden;
    padding-left: 10px;
    padding-right: 8px;
    padding-bottom: 8px;
    font-size: 16px;
    margin: 0;
    margin-top: 1em;
    font-family: 'Roboto';
    display: flex;
    flex-direction: column;
    row-gap: 1px;
  }
</style>
