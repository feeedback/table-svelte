<script>
  export let counts = {};
  export let icons = {};
  export let pageNow = 0;
  import { THIN_SPACE } from '../utils/table-utils.js';
</script>

<tr>
  <td colspan={counts.columnsShown} class="table-counts-container-td">
    <div class="table-counts-container">
      <div class="table-counts__count-fitered">
        {counts.rows.currentStart}-{counts.rows.currentEnd} of{@html THIN_SPACE}<span
          class="table-counts__count-filtered"
        >
          {counts.rows.filtered}</span
        >
        <span class="table-counts__count-total">({counts.rowsAll})</span>
      </div>
      <div class="pagination__count-page">
        <button
          class="icon-page material-symbols-outlined"
          disabled={pageNow === 0}
          on:click|capture|stopPropagation={() => {
            pageNow = 0;
          }}>{@html icons.first}</button
        ><button
          class="icon-page material-symbols-outlined"
          disabled={pageNow === 0}
          on:click|capture|stopPropagation={() => {
            pageNow -= 1;
          }}>{@html icons.prev}</button
        ><span class="pagination__count-page-text"
          >Page: <span class="pagination__count-page-text-current">{counts.page.current}</span
          >{@html `${THIN_SPACE}/${THIN_SPACE}`}{counts.page.total}</span
        ><button
          class="icon-page material-symbols-outlined"
          disabled={pageNow >= counts.page.total - 1}
          on:click|capture|stopPropagation={() => {
            pageNow += 1;
          }}>{@html icons.next}</button
        ><button
          class="icon-page material-symbols-outlined"
          disabled={pageNow >= counts.page.total - 1}
          on:click|capture|stopPropagation={() => {
            pageNow = counts.page.total - 1;
          }}>{@html icons.last}</button
        >
      </div>
    </div>
  </td>
</tr>

<style>
  button:focus {
    border-color: #666;
  }
  .table-counts-container-td {
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
  .pagination__count-page {
    display: flex;
    align-items: center;
    column-gap: 7px;
  }
  .pagination__count-page-text {
    width: 8.5em;
    text-align: center;
    color: #989898;
  }
  .pagination__count-page-text-current {
    color: #000;
  }
  .table-counts__count-filtered {
    color: #000;
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
</style>
