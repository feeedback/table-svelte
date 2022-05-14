<script>
  export let columns = [];
  export let hiddenColumns = new Set();
  export let handlers = {};
  export let icons = {};
</script>

<div class="columns-hide-list__container">
  <details>
    <summary class="columns-hide-list__header">Columns</summary>
    <div class="columns-hide-list__list">
      {#each columns as col, i}
        <div class="columns-hide-list__list-element">
          <div class="columns-hide-list__list-element__name-box" class:columns-list__name_hidden={hiddenColumns.has(i)}>
            <span class="columns-hide-list__list-element__name" title={col}>{col}</span>
          </div>
          <div class="columns-hide-list__list-element__button-box">
            {#if hiddenColumns.has(i)}
              <button
                class="columns-hide-list__list-element__add-column material-symbols-outlined"
                on:click={() => handlers.addColumn(i)}>{@html icons.add}</button
              >
            {:else}
              <button
                class="columns-hide-list__list-element__hide-column material-symbols-outlined"
                on:click={() => handlers.hideColumn(i)}>{@html icons.hide}</button
              >
            {/if}
          </div>
        </div>
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
  }

  .columns-hide-list__list {
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

  .columns-hide-list__list-element {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  /* .columns-hide-list__list-element:not(:last-child) {
    margin-bottom: 4px;
  } */

  .columns-hide-list__list-element button {
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
  .columns-hide-list__list-element:hover button {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
    /* border: 1px rgb(230, 230, 230) dotted; */
  }
  .columns-hide-list__list-element:hover button.columns-hide-list__list-element__hide-column {
    font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 200, 'opsz' 40;
  }
  .columns-hide-list__list-element button:hover {
    border-style: solid;
    /* border: 1px rgb(220, 220, 220) dotted; */
  }
  .columns-hide-list__list-element__hide-column {
    color: #df5555;
  }
  .columns-hide-list__list-element button.columns-hide-list__list-element__hide-column:hover {
    color: rgb(216, 34, 34);
  }
  .columns-hide-list__list-element__add-column {
    color: rgb(7, 184, 7);
  }
  .columns-hide-list__list-element__add-column:hover {
    color: rgb(0, 153, 0);
  }

  .columns-hide-list__list-element__name-box {
    width: calc(100% - 3px - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .columns-list__name_hidden {
    text-decoration: line-through;
    color: #b7b7b7;
    text-decoration-thickness: 1px;
    text-decoration-color: rgba(225, 128, 128, 0.486);
    /* text-decoration-style: double; */
  }
</style>
