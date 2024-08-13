<script lang="ts" setup>
import { reactive, ref, Ref, watch } from 'vue'
import { useHistoricalStore } from '@/stores/historical_range_store'
import { useSelectedStore } from '@/stores/selected_range_store'
import myLogger from './log/MyLogger'
import type { SelectProps } from 'ant-design-vue'

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
const onQuerySubmit = () => {
  myLogger.d('Submit query range.', JSON.stringify(selectedStore.typedList))
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
}

const onDeselectOption = (value: any) => {
  myLogger.d('Deselect option.', JSON.stringify(value))
  const split = value.split('-')
  const from = Number(split[0])
  const to = Number(split[1])
  selectedStore.remove({ type: Number(selectedKeys.value[0]), from: from, to: to })
}

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
        :style="{ height: '100vh', width: '80vw',margin: '24px 16px', padding: '24px', background: '#0ff', minHeight: '100%' }">

        <a-form
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          :style="{height: '30vh', width: '30vw',}"
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
</style>

