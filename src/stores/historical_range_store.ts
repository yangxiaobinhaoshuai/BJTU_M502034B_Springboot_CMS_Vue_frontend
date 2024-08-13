import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useHistoricalStore = defineStore('historical_range_store', () => {

  const rangList = ref<Array<RangeData>>([])

  const displayList = computed(() => rangList.value.map(range => range.from.toString() + '-' + range.to.toString()))

  function add(range: RangeData) {
    rangList.value.push(range)
  }

  function remove(range: RangeData) {
    const index = rangList.value.indexOf(range, 0)
    if (index > -1) {
      rangList.value.splice(index, 1)
    }
  }


  return { rangList, displayList, add, remove }
})
