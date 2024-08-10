import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useHistoricalStore = defineStore('historical_range_store', () => {

  const rangList = ref<Array<RangeData>>([])

  function add(range: RangeData) {
    rangList.value.push(range)
  }

  function remove(range: RangeData) {
    const index = rangList.value.indexOf(range, 0)
    if (index > -1) {
      rangList.value.splice(index, 1)
    }
  }


  return { rangList, add, remove }
})
