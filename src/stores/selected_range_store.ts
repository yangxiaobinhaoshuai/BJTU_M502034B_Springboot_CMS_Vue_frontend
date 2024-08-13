import { computed, ref } from 'vue'
import { defineStore, mapState } from 'pinia'
import myLogger from '@/log/MyLogger'
import _ from 'lodash'

export const useSelectedStore = defineStore('selected_range_store', () => {
  const rangList = ref<Array<RangeData>>([])

  const displayList = computed(() => rangList.value.map(range => range.from.toString() + '-' + range.to.toString()))

  function add(range: RangeData) {
    const contains = rangList.value.find(e => _.isEqual(e, range))
    myLogger.d('selected_range_store.add range:', JSON.stringify(range), ' contains: ', contains)
    if (!contains) {
      rangList.value.push(range)
    } else {
      myLogger.d('Already add ', range)
    }
  }

  function remove(range: RangeData) {
    const index = rangList.value.indexOf(range, 0)
    if (index > -1) {
      rangList.value.splice(index, 1)
    }
  }

  return { rangList, displayList, add, remove }
})
