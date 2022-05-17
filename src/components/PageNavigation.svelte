<script>
  import { THIN_SPACE } from '../utils/table-utils.js';

  export let counts = {};
  export let icons = {};
  export let pageNow = 0;
</script>

<div class="page-navigation__container">
  <button
    class="page-navigation__button material-symbols-outlined"
    disabled={pageNow === 0}
    on:click|capture|stopPropagation={() => {
      pageNow = 0;
    }}>{@html icons.first}</button
  ><button
    class="page-navigation__button material-symbols-outlined"
    disabled={pageNow === 0}
    on:click|capture|stopPropagation={() => {
      pageNow -= 1;
    }}>{@html icons.prev}</button
  ><span class="page-navigation__text"
    >Page: <span class="page-navigation__count-current-page">{counts.page.current}</span
    >{@html `${THIN_SPACE}/${THIN_SPACE}`}{counts.page.total}</span
  ><button
    class="page-navigation__button material-symbols-outlined"
    disabled={pageNow >= counts.page.total - 1}
    on:click|capture|stopPropagation={() => {
      pageNow += 1;
    }}>{@html icons.next}</button
  ><button
    class="page-navigation__button material-symbols-outlined"
    disabled={pageNow >= counts.page.total - 1}
    on:click|capture|stopPropagation={() => {
      pageNow = counts.page.total - 1;
    }}>{@html icons.last}</button
  >
</div>

<style>
  .page-navigation__container > button:focus {
    border-color: #666;
  }
  .page-navigation__container {
    display: flex;
    align-items: center;
    column-gap: 7px;
  }
  .page-navigation__text {
    width: 8.5em;
    text-align: center;
    color: #989898;
  }
  .page-navigation__count-current-page {
    color: #000;
  }
  .page-navigation__button {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 40;
    padding: 0;
    margin: 0;
    border: 1px white solid;
    border-radius: 3px;
    background-color: #fbfbfb;
    user-select: none;
    cursor: pointer;
    height: 26px;
    width: 26px;
    animation: opactity-during-loading-font 0.8s;
  }
  .page-navigation__button:not([disabled]):hover {
    border-color: rgb(220 220 220);
  }
  .page-navigation__button:not([disabled]):active {
    color: rgb(0, 0, 255);
    background-color: white;
  }
</style>
