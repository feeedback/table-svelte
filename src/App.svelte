<script>
  import { generateTestData } from './utils/generate-data.js';
  import Table from './components/Table.svelte';

  const { data, headers: columns } = generateTestData(1000);
</script>

<Table
  {data}
  {columns}
  settings={{
    hiddenColumns: [columns.indexOf('Description')],
    rowsPerPage: 25,
    sortedBy: 'Name',
    startFilteringDebounceMs: 70,
    columnsIdxIsWrap: [columns.indexOf('Description')],
  }}
/>
