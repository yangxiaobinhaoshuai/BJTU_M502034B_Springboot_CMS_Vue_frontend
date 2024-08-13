import { computed, ref } from 'vue'
import { defineStore, mapState } from 'pinia'
import myLogger from '@/log/MyLogger'
import _ from 'lodash'

export const useSelectedStore = defineStore('selected_range_store', () => {

  const currentType = ref(1)

  const rangList = ref<Array<RangeData>>([])

  const typedList = computed(() => rangList.value.filter(r => r.type == currentType.value))

  const displayList = computed(() => typedList.value.map(range => range.from.toString() + '-' + range.to.toString()))

  function add(range: RangeData) {
    const contains = rangList.value.find(e => _.isEqual(e, range))
    myLogger.d('selected_range_store.add range:', JSON.stringify(range), ' contains: ', Boolean(contains))
    if (!contains) {
      rangList.value.push(range)
    } else {
      myLogger.d('Already add ', range)
    }
  }

  function remove(range: RangeData) {
    const index = rangList.value.findIndex(r=> r.type == range.type && r.from == range.from && r.to == range.to)
    if (index > -1) {
      rangList.value.splice(index, 1)
    }
  }

  function setType(type: number) {
    currentType.value = type
  }

  return { currentType, rangList, typedList, displayList, setType, add, remove }
})
