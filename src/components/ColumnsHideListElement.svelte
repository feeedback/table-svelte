<script>
  import { iconSymbols } from '../utils/symbols.js';

  const icons = iconSymbols.column;

  export let columnName = '';
  export let columnIndex = 0;
  export let hiddenColumns = [];
  export let handlers = {};
</script>

<div class="columns-hide-list-element">
  <div
    class="columns-hide-list-element__name-box"
    class:columns-list__name_hidden={hiddenColumns.includes(columnIndex)}
  >
    <span class="columns-hide-list-element__name" title={columnName}>{columnName}</span>
  </div>

  <div class="columns-hide-list-element__button-box">
    {#if hiddenColumns.includes(columnIndex)}
      <button
        class="columns-hide-list-element__add-column material-symbols-outlined"
        on:click={() => handlers.showColumn(columnIndex)}>{@html icons.add}</button
      >
    {:else}
      <button
        class="columns-hide-list-element__hide-column material-symbols-outlined"
        on:click={() => handlers.hideColumn(columnIndex)}>{@html icons.hide}</button
      >
    {/if}
  </div>
</div>

<style>
  .columns-hide-list-element {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  /* .columns-hide-list-element:not(:last-child) {
    margin-bottom: 4px;
  } */

  .columns-hide-list-element__button-box {
    overflow: hidden;
    height: 26px;
    width: 26px;
  }
  .columns-hide-list-element button {
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
    height: 26px;
    width: 26px;
  }
  .columns-hide-list-element:hover button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
    /* border: 1px rgb(230, 230, 230) dotted; */
  }
  .columns-hide-list-element:hover button.columns-hide-list-element__hide-column {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
  }
  .columns-hide-list-element button:hover {
    border-style: solid;
    /* border: 1px rgb(220, 220, 220) dotted; */
  }
  .columns-hide-list-element__hide-column {
    color: #df5555;
  }
  .columns-hide-list-element button.columns-hide-list-element__hide-column:hover {
    color: rgb(216, 34, 34);
  }
  .columns-hide-list-element__add-column {
    color: rgb(7, 184, 7);
  }
  .columns-hide-list-element__add-column:hover {
    color: rgb(0, 153, 0);
  }

  .columns-hide-list-element__name-box {
    width: calc(100% - 3px - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .columns-list__name_hidden {
    text-decoration: line-through;
    /* color: #b7b7b7; */
    color: #a3a3a3;
    /* color: #757777; */
    text-decoration-thickness: 1px;
    /* text-decoration-color: rgba(225, 128, 128, 0.486); */
    text-decoration-color: rgba(225, 128, 128, 0.6);
    /* text-decoration-style: double; */
  }
</style>
