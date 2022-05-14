<script>
  export let columns = [];
  export let hiddenColumns = new Set();
  export let handlers = {};
  export let icons = {};
</script>

<div class="component-table__columns-list__box">
  <details>
    <summary class="columns-list__header">Columns</summary>
    <div class="columns-list">
      {#each columns as col, i}
        <div class="columns-list__element">
          <div class="columns-list__name-box" class:columns-list__name_hidden={hiddenColumns.has(i)}>
            <span class="columns-list__name" title={col}>{col}</span>
          </div>
          <div class="columns-list__button-box">
            {#if hiddenColumns.has(i)}
              <button class="add-column-button material-symbols-outlined" on:click={() => handlers.addColumn(i)}
                >{@html icons.addColumn}</button
              >
            {:else}
              <button class="hide-column-button material-symbols-outlined" on:click={() => handlers.hideColumn(i)}
                >{@html icons.hideColumn}</button
              >
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </details>
</div>

<style>
  .component-table__columns-list__box {
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

  .component-table__columns-list__box .columns-list__element button {
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
  .component-table__columns-list__box .columns-list__element:hover button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
    /* border: 1px rgb(230, 230, 230) dotted; */
  }
  .component-table__columns-list__box .columns-list__element:hover button.hide-column-button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
  }
  .component-table__columns-list__box .columns-list__element button:hover {
    border-style: solid;
    /* border: 1px rgb(220, 220, 220) dotted; */
  }

  .component-table__columns-list__box .columns-list__element .hide-column-button {
    /* color: #c85d5d; */
    /* color: #cd5b5b; */
    color: #df5555;
    /* font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol'; */
  }
  .component-table__columns-list__box .columns-list__element button.hide-column-button:hover {
    color: rgb(216, 34, 34);
  }
  .component-table__columns-list__box .columns-list__element .add-column-button {
    color: rgb(7, 184, 7);
  }
  .component-table__columns-list__box .columns-list__element .add-column-button:hover {
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
