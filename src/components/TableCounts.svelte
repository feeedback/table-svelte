<script>
  import { THIN_SPACE } from '../utils/symbols.js';

  export let counts = {};
</script>

<div class="table-counts__count-fitered">
  <span class="table-counts__rows-shown">{counts.rows.currentStart}-{counts.rows.currentEnd}</span
  >{@html THIN_SPACE}of{@html THIN_SPACE}<span class="table-counts__count-filtered"> {counts.rows.filtered}</span>
  <span class="table-counts__count-total">({counts.rowsAll})</span>
</div>

<style>
  .table-counts__count-fitered {
    display: flex;
    align-items: center;
    color: rgb(152, 152, 152);
  }
  .table-counts__rows-shown {
    color: rgb(66, 66, 66);
  }
  .table-counts__count-total {
    margin-left: 5px;
    color: #aaa;
    font-size: 16px;
  }
</style>
