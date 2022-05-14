<script>
  import { THIN_SPACE } from '../utils/table-utils.js';

  export let counts = {};
</script>

<div class="table-counts__count-fitered">
  {counts.rows.currentStart}-{counts.rows.currentEnd} of{@html THIN_SPACE}<span class="table-counts__count-filtered">
    {counts.rows.filtered}</span
  >
  <span class="table-counts__count-total">({counts.rowsAll})</span>
</div>

<style>
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
</style>
