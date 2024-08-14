<script lang="ts" setup>
import { provide, reactive, Ref, ref, watch } from 'vue'
import { useHistoricalStore } from '@/stores/historical_range_store'
import { useSelectedStore } from '@/stores/selected_range_store'
import myLogger from './log/MyLogger'
import type { SelectProps } from 'ant-design-vue'
import { ApiResult, get } from './net/api'
import 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import RangeData from './pojo/RangeData'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// TODO color
provide(THEME_KEY, 'dark')
// provide(THEME_KEY, 'light')

const historicalStore = useHistoricalStore()
const selectedStore = useSelectedStore()

selectedStore.$subscribe(() => {
  myLogger.d('selectedStore state changed, new displayList ===> ', JSON.stringify(selectedStore.displayList))
  selectRanges.value = selectedStore.displayList
})

historicalStore.$subscribe(() => {
  const newHisVal = historicalStore.typedList.map(d => {
    return {
      // label: `${d.from}-${d.to}`,
      value: `${d.from}-${d.to}`
    }
  })
  myLogger.d('historicalStore state changed, newHisVal ===> ', JSON.stringify(newHisVal))
  historical_options.value = newHisVal
})


const currentQueryType = ref<string[]>(['1'])
const collapsed = ref<boolean>(false)

// 查询类别变化
watch(currentQueryType, (newVal) => {
  let type = Number(newVal[0])
  myLogger.d('queryTab changed to: ', JSON.stringify(type), JSON.stringify(currentQueryType))
  selectedStore.setType(type)
  historicalStore.setType(type)

  // 清空已经查询的数据
  myLogger.d('reset data cause tab index changed.')
  listData.value = []
  pie_option.value.series[0].data = []
  bar_option.value.xAxis.data = []
  bar_option.value.series[0].data = []
  listRangeOptions.value = []
  listCurrentSelectRange.value = undefined
})

//  Range Dialog
const dialogFormVisible = ref(false)

// 接口返回的要展示的数据
const display_data = ref<Array<ApiResponse>>([])

// 必须在 watch 之前 initialize
// 当前展示 list 的范围
const selectListRangeOption = ref({})

watch([display_data, selectListRangeOption], ([newVal,newOpt]) => {
  myLogger.d('watch for display_data new val: ', JSON.stringify(newVal.map(r => r.data?.length || 0)))
  // pie char
  pie_option.value.series[0].data = newVal.map((res: ApiResponse) => {
    return { value: res.data?.length || 0, name: `${res.from} - ${res.to}` }
  })

  // bar chart
  const xTitles = newVal.map((res: ApiResponse) => `${res.from} - ${res.to}`)
  const yData = newVal.map((res: ApiResponse) => res.data?.length || 0)
  myLogger.d(`bar chart, xTitles: ${xTitles}, yData: ${yData}.`)
  bar_option.value.xAxis.data = xTitles
  bar_option.value.series[0].data = yData

  const listRange = selectListRangeOption.value
  myLogger.d("display list change, current list range Data: ", JSON.stringify(listRange))
  const index = newVal.findIndex((res => res.from == listRange.from && res.to == listRange.to))
  myLogger.d('response index ', index)
  if (index >= 0) {
    const travelers = newVal[index].data
    //listData.value.push(...travelers)
    listData.value = travelers
    //myLogger.d('after insert listData:', JSON.stringify(listData))
  }
})

const onQuerySubmit = () => {
  const queryType = Number(currentQueryType.value[0])

  const selectRanges = Array.from(selectedStore.typedList.values())
  const rangesArr = selectRanges.map((range) => {
    return { from: range.from, to: range.to }
  })
  myLogger.d(`Submit query, queryType: ${queryType}, selectRanges: ${JSON.stringify(rangesArr)}`)

  let promiseArr
  switch (queryType) {
    case 1:
      myLogger.d('Query for birth year.')
      // birth_year_range?from=1990&to=2004
      promiseArr = rangesArr.map((pair) => get<ApiResponse>('birth_year_range?', { from: pair.from, to: pair.to }))
      break
    case 2:
      myLogger.d('Query for miles.')
      // mile_range?from=1284&to=14505
      promiseArr = rangesArr.map((pair) => get<ApiResponse>('mile_range?', { from: pair.from, to: pair.to }))
      break
    case 3:
      myLogger.d('Query for time.')
      // time_range?from=2&to=63
      promiseArr = rangesArr.map((pair) => get<ApiResponse>('time_range?', { from: pair.from, to: pair.to }))
      break
    default:
      break
  }

  if (promiseArr) {
    Promise.all(promiseArr).then((result: Awaited<ApiResult<ApiResponse>>[]) => {
      // myLogger.d('Results for all: ', JSON.stringify(result))
      display_data.value = result
    })
  }

  listRangeOptions.value = selectedStore.typedList.map((r) => {
    return {
      value: `${r.from}-${r.to}`
    }
  })

  myLogger.d('onQuerySubmit, last set current list range: ', JSON.stringify(selectedStore.rangList))

  if (selectedStore.rangList.length > 0) {
    selectListRangeOption.value = new RangeData(queryType, selectedStore.rangList[0].from, selectedStore.rangList[0].to)
  }

}

const onDialogConfirmAction = () => {
  const r = { type: Number(currentQueryType.value[0]), from: theCreatedRange.from, to: theCreatedRange.to }
  myLogger.d('Confirm range dialog.', JSON.stringify(r))
  selectedStore.add(r)
  historicalStore.add(r)
  dialogFormVisible.value = false
}

//  输入的范围
const theCreatedRange = reactive({
  type: 0,
  from: 0,
  to: 0
})

const placement = ref('topLeft' as const)

const onDismiss = () => {
  theCreatedRange.to = 0
  theCreatedRange.from = 0
  myLogger.d('Dismiss range selection.')
}


// 输入框宽度
const formLabelWidth = '140px'

//  SelectionView
const maxTagTextLength = ref(10)
let historical_options = ref<SelectProps['options']>([])
// input 中所有输入的范围
const selectRanges: Ref<string[]> = ref([])


const onSelectOption = (value: any) => {
  myLogger.d('Select option.', JSON.stringify(value))
  const split = value.split('-')
  const from = Number(split[0])
  const to = Number(split[1])
  selectedStore.add({ type: Number(currentQueryType.value[0]), from: from, to: to })
}

const onDeselectOption = (value: any) => {
  myLogger.d('Deselect option.', JSON.stringify(value))
  const split = value.split('-')
  const from = Number(split[0])
  const to = Number(split[1])
  selectedStore.remove({ type: Number(currentQueryType.value[0]), from: from, to: to })
}

// 当前 tab
const activeTabIndex = ref('1')
watch(activeTabIndex, (newVal, oldVal) => {
  switch (newVal) {
    case '1':
      listRangeDisable.value = false
      break;
    case '2':
      listRangeDisable.value = true
      break;
    case '3':
      listRangeDisable.value = true
      break;
    default: break
  }
})

const pie_option = ref({
  title: {
    text: '饼图',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines']
  },
  series: [
    {
      name: 'Traffic Sources',
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const bar_option = ref({
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [],
      type: 'bar'
    }
  ]
})

// 列表分页器
const pagination = {
  onChange: (page: number) => {
    console.log(page)
    myLogger.d('list page changed, newPage: ', page)
  },
  pageSize: 10
}

// 列表数据
const listData = ref([])

// 列表当前正在选择的范围
const listCurrentSelectRange = ref(undefined)
// 是否禁用列表
const listRangeDisable = ref(false)
// 列表所有范围
const listRangeOptions = ref<SelectProps['options']>([])


// 列表选择 callback
const handleListRangeChange: SelectProps['onChange'] = value => {
  // {"value":"1993-2030","key":"1993-2030","option":{"value":"1993-2030"}}
  myLogger.d('handleListRangeChange, val: ', JSON.stringify(value))
  const strRange = value.value
  const split = strRange.split('-')
  const from = split[0]
  const to = split[1]
  const queryType = Number(currentQueryType.value[0])
  selectListRangeOption.value = new RangeData(queryType, from, to)
}

</script>

<template>
  <a-layout>

    <!-- The Slider-->
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="currentQueryType" theme="dark" mode="inline">
        <a-menu-item key="1">
          <span>按年龄范围查询</span>
        </a-menu-item>
        <a-menu-item key="2">
          <span>按里程范围查询</span>
        </a-menu-item>
        <a-menu-item key="3">
          <span>按飞行时间范围查询</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!--The Content Layout-->
    <a-layout>

      <a-layout-content
        :style="{ height: '100vh', width: '80vw',margin: '24px 16px', padding: '24px',
        //background: '#0ff',
        background: '#fff',
        minHeight: '100%' }">

        <a-form
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          :style="{height: '15vh', width: '30vw',}"
        >

          <a-space class="horizontalContain">

            <h1 class="titleSingleLine">
              查询范围
            </h1>

            <a-select
              class="selectRange"
              v-model:value="selectRanges"
              option-label-prop="children"
              mode="multiple"
              :placement="placement"
              style="width: 100%"
              placeholder="Select Item..."
              :max-tag-text-length="maxTagTextLength"
              :options="historical_options"
              :style="{marginLeft: '30px',marginRight:10,paddingRight:20}"
              @deselect="onDeselectOption"
              @select="onSelectOption"
            ></a-select>

          </a-space>


          <div class="horizontalContain" :style="{marginLeft: '156px',marginRight:'20px',marginTop:'20px'}">

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit" @click="dialogFormVisible = true">添加查询范围</a-button>
            </a-form-item>


            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit" @click="onQuerySubmit">查询</a-button>
            </a-form-item>

          </div>

        </a-form>

        <!--Tabs-->
        <a-tabs v-model:activeKey="activeTabIndex">

          <a-tab-pane key="1" tab="Tab 1">

            <!-- List -->
            <a-list item-layout="vertical" size="small" :pagination="pagination" :data-source="listData">

              <template #renderItem="{ item }">
                <a-list-item key="item.title">
                  <a-list-item-meta>
                    <template #title>
                      <a :href="item.href">
                        {{ item }}
                      </a>
                    </template>
                  </a-list-item-meta>
                  <!--{{ item.content }}-->
                </a-list-item>
              </template>
            </a-list>

          </a-tab-pane>

          <a-tab-pane key="2" tab="Tab 2">
            <v-chart class="chart" :option="pie_option" autoresize />
          </a-tab-pane>

          <a-tab-pane key="3" tab="Tab 3">
            <v-chart class="chart" :option="bar_option" autoresize />
          </a-tab-pane>

          <template #leftExtra>
            <a-select class="listSpecialRangeSelection"
                      placeholder="请选择列表具体范围"
                      v-model:value="listCurrentSelectRange"
                      label-in-value
                      style="width: 140px"
                      :disabled="listRangeDisable"
                      :options="listRangeOptions"
                      @change="handleListRangeChange"
            ></a-select>
          </template>
        </a-tabs>


      </a-layout-content>

      <!--  Root Content Layout  -->
    </a-layout>


    <!--  Root Layout  -->
  </a-layout>


  <!--The Range Dialog-->
  <el-dialog v-model="dialogFormVisible" @close="onDismiss" title="添加查询范围" width="500">
    <el-form :model="theCreatedRange">

      <el-form-item label="From" :label-width="formLabelWidth">
        <el-input v-model="theCreatedRange.from" autocomplete="off" />
      </el-form-item>

      <el-form-item label="To" :label-width="formLabelWidth">
        <el-input v-model="theCreatedRange.to" autocomplete="off" />
      </el-form-item>


    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onDialogConfirmAction">Confirm</el-button>
      </div>
    </template>
  </el-dialog>


</template>

<style>
.selectRange {
  min-width: 380px;
}

.titleSingleLine {
  white-space: nowrap;
}

.horizontalContain {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 132px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}

.ant-typography-single-line {
  white-space: nowrap;
}

.tabs-extra-demo-button {
  margin-right: 16px;
}

.ant-row-rtl .tabs-extra-demo-button {
  margin-right: 0;
  margin-left: 16px;
}

.chart {
  height: 100vh;
}

.listSpecialRangeSelection {
  margin-right: 20px;
}
</style>

