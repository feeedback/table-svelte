<script>
  import TableCounts from './TableCounts.svelte';
  import PageNavigation from './PageNavigation.svelte';

  export let counts = {};
  export let icons = {};
  export let pageNow = 0;
</script>

<tr class="table-counts-container__row">
  <td colspan={counts.columnsShown} class="table-counts-container__cell">
    <div class="table-counts-container">
      <TableCounts {counts} />
      <PageNavigation {counts} {icons} bind:pageNow />
    </div>
  </td>
</tr>

<style>
  .table-counts-container__cell {
    padding: 0;
    min-width: 32em;
  }
  .table-counts-container {
    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: center;
    /* width: 80%; */
    font-size: 18px;
    margin-bottom: 4px;
    /* font-family: 'Roboto'; */
    vertical-align: middle;
    height: 28px;
  }
</style>
