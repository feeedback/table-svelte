<script>
  import { generateTestData } from './utils/generate-data.js';
  import MyTable from './components/MyTable.svelte';

  const { data, headers: columns } = generateTestData(3000);
</script>

<MyTable
  {data}
  {columns}
  settings={{
    hideColumns: new Set([columns.indexOf('Description')]),
    rowsPerPage: 25,
    sortedBy: 'Name',
    startFilteringDebounceMs: 100,
  }}
/>
