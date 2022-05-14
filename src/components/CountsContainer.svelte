<script>
  export let counts = {};
  export let icons = {};
  export let pageNow = 0;
  import Counts from './Counts.svelte';
  import PageNavigation from './PageNavigation.svelte';
</script>

<tr>
  <td colspan={counts.columnsShown} class="table-counts-container-td">
    <div class="table-counts-container">
      <Counts {counts} />
      <PageNavigation {counts} {icons} bind:pageNow />
    </div>
  </td>
</tr>

<style>
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
</style>
