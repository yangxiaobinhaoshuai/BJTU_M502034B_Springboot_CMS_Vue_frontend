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

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

provide(THEME_KEY, 'dark')

const historicalStore = useHistoricalStore()
const selectedStore = useSelectedStore()

selectedStore.$subscribe((mutation, state) => {
  myLogger.d('selectedStore state changed, new displayList ===> ', JSON.stringify(selectedStore.displayList))
  select_value.value = selectedStore.displayList
})

historicalStore.$subscribe((mutation, state) => {
  const newHisVal = historicalStore.typedList.map(d => {
    return {
      // label: `${d.from}-${d.to}`,
      value: `${d.from}-${d.to}`
    }
  })
  myLogger.d('historicalStore state changed, newHisVal ===> ', JSON.stringify(newHisVal))
  historical_options.value = newHisVal
})


const selectedKeys = ref<string[]>(['1'])
const collapsed = ref<boolean>(false)


watch(selectedKeys, (newVal) => {
  let type = Number(newVal[0])
  myLogger.d('selectedStore changed to: ', JSON.stringify(type))
  selectedStore.setType(type)
  historicalStore.setType(type)
})

//  Range Dialog
const dialogFormVisible = ref(false)

const display_data = reactive<Array<ApiResponse>>([])

watch(display_data, (newVal) => {
  myLogger.d('watch for display_data new val: ', JSON.stringify(newVal.map(r => r.data?.length || 0)))
  // pie char
  const newPieChar = newVal.map((res: ApiResponse) => {
    return { value: res.data?.length || 0, name: `${res.from} - ${res.to}` }
  })
  pie_option.value.series[0].data = newPieChar

  // bar chart
  const xTitles = newVal.map((res: ApiResponse) => `${res.from} - ${res.to}`)
  const yData = newVal.map((res: ApiResponse) => res.data?.length || 0)
  myLogger.d(`bar chart, xTitles: ${xTitles}, yData: ${yData}.`)
  bar_option.xAxis.data = xTitles
  bar_option.series[0].data = yData

  const travelers = newVal[0].data
  listData.value.push(...travelers)
  myLogger.d('after insert listData:', JSON.stringify(listData))
})

const onQuerySubmit = () => {
  const queryType = Number(selectedKeys.value[0])
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
      display_data.push(...result)
    })
  }

}

const onDialogConfirmAction = () => {
  const r = { type: Number(selectedKeys.value[0]), from: select_range.from, to: select_range.to }
  myLogger.d('Confirm range dialog.', JSON.stringify(r))
  selectedStore.add(r)
  historicalStore.add(r)
  dialogFormVisible.value = false
}

const select_range = reactive({
  type: 0,
  from: 0,
  to: 0
})

const placement = ref('topLeft' as const)

const onDismiss = () => {
  select_range.to = 0
  select_range.from = 0
  myLogger.d('Dismiss range.', JSON.stringify(select_range))
}

const handleChange = (value: string) => {
  myLogger.d('Change range.', JSON.stringify(value))
}

const formLabelWidth = '140px'

//  SelectionView
const maxTagTextLength = ref(10)
let historical_options = ref<SelectProps['options']>([])
const select_value: Ref<string[]> = ref([])


const onSelectOption = (value: any) => {
  myLogger.d('Select option.', JSON.stringify(value))
  const split = value.split('-')
  const from = Number(split[0])
  const to = Number(split[1])
  selectedStore.add({ type: Number(selectedKeys.value[0]), from: from, to: to })
}

const onDeselectOption = (value: any) => {
  myLogger.d('Deselect option.', JSON.stringify(value))
  const split = value.split('-')
  const from = Number(split[0])
  const to = Number(split[1])
  selectedStore.remove({ type: Number(selectedKeys.value[0]), from: from, to: to })
}

const activeKey = ref('1')

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
      // data: [
      //   { value: 335, name: 'Direct' },
      //   { value: 310, name: 'Email' },
      //   { value: 234, name: 'Ad Networks' },
      //   { value: 235, name: 'Video Ads' },
      //   { value: 1548, name: 'Search Engines' }
      // ],
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


const bar_option = {
  xAxis: {
    type: 'category',
    // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      // data: [120, 200, 150, 80, 70, 110, 130],
      data: [],
      type: 'bar'
    }
  ]
}

const pagination = {
  onChange: (page: number) => {
    console.log(page)
    myLogger.d('list page changed, newPage: ', page)
  },
  pageSize: 10
}

const listData = ref([])

</script>

<template>
  <a-layout>

    <!-- The Slider-->
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
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

      <!-- TODO bg color-->
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
              v-model:value="select_value"
              option-label-prop="children"
              mode="multiple"
              :placement="placement"
              style="width: 100%"
              placeholder="Select Item..."
              :max-tag-text-length="maxTagTextLength"
              :options="historical_options"
              :style="{marginLeft: '30px',marginRight:10,paddingRight:20}"
              @change="handleChange"
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
        <a-tabs v-model:activeKey="activeKey">

          <a-tab-pane key="1" tab="Tab 1">

            <!--     List       -->
            <a-list item-layout="vertical" size="small" :pagination="pagination" :data-source="listData">

              <template #renderItem="{ item, index }">
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
            <a-button class="tabs-extra-demo-button">选择列表范围</a-button>
          </template>
        </a-tabs>


      </a-layout-content>

      <!--  Root Content Layout  -->
    </a-layout>


    <!--  Root Layout  -->
  </a-layout>


  <!--The Range Dialog-->
  <el-dialog v-model="dialogFormVisible" @close="onDismiss" title="添加查询范围" width="500">
    <el-form :model="select_range">

      <el-form-item label="From" :label-width="formLabelWidth">
        <el-input v-model="select_range.from" autocomplete="off" />
      </el-form-item>

      <el-form-item label="To" :label-width="formLabelWidth">
        <el-input v-model="select_range.to" autocomplete="off" />
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
</style>

