<script>
  export let filterInputBindValues;
  export let columnsShown = [];
  export let stateFilter = [];
  export let FILTER_ENUM = {};
  export let handleFilterTyping;
</script>

<tr class="filter-container__row">
  {#each columnsShown as [columnIndex, columnName]}
    <th class="filter-container__cell">
      <input
        class="filter-container__input"
        aria-label={`filter by ${columnName}`}
        bind:value={filterInputBindValues[columnIndex]}
        on:input|capture={handleFilterTyping(columnIndex)}
        class:active-filter={stateFilter[columnIndex] !== FILTER_ENUM.NULL}
        class:active-filter-expression={stateFilter[columnIndex].includes('EXPRESSION')}
        class:bad-expression={stateFilter[columnIndex] === FILTER_ENUM.INVALID_EXPRESSION}
        class:shake={stateFilter[columnIndex] === FILTER_ENUM.INVALID_EXPRESSION}
      />
    </th>
  {/each}
</tr>

<style>
  .filter-container__input {
    line-height: normal;
    text-align: center;
    border: 2px solid #ddd;
    font-style: italic;
    width: calc(99% - 4px);
  }

  .filter-container__input.active-filter {
    border-color: hsl(120deg 35% 73%);
  }
  .filter-container__input.active-filter-expression {
    border-color: hsl(201deg 100% 79%);
  }
  .filter-container__input.bad-expression {
    border-color: hsl(0deg 54% 82%);
  }

  .filter-container__input.bad-expression:focus-visible,
  .filter-container__input.active-filter:focus-visible {
    outline: none;
  }

  @keyframes shake-little {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70% {
      transform: translateX(-4px);
    }
    20%,
    40%,
    60% {
      transform: translateX(4px);
    }
    80% {
      transform: translateX(2px);
    }
    90% {
      transform: translateX(-2px);
    }
  }
  /* @keyframes shake-border-color {
    0% {
      border-color: hsl(0deg 54% 82%);
    }
    60% {
      border-color: rgb(212, 89, 89);
    }
    100% {
      border-color: hsl(0deg 54% 82%);
    }
  } */
  .filter-container__input.shake {
    animation: shake-little 0.15s ease-out 0s 1 normal none;
    /* shake-border-color 0.1s ease-out 0s 1 normal none; */
  }
</style>
