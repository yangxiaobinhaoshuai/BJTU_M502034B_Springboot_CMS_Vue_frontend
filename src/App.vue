<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { SelectProps } from 'ant-design-vue'
import { useHistoricalStore } from '@/stores/historical_range_store'
import { useSelectedStore } from '@/stores/selected_range_store'
import MyLogger from './log/MyLogger'

const historicalStore = useHistoricalStore()
const selectedStore = useSelectedStore()


const selectedKeys = ref<string[]>(['1'])
const collapsed = ref<boolean>(false)


interface FormState {
  username: string;
  password: string;
  remember: boolean;
}

const formState = reactive<FormState>({
  username: '',
  password: '',
  remember: true
})

//  Range Dialog
const dialogFormVisible = ref(false)
const dialogConfirmAction = () => {
  MyLogger.d('Confirm range dialog.', JSON.stringify(form))
  dialogFormVisible.value = false
}

//  TODO
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: ''
})

const formLabelWidth = '140px'

//  SelectionView
const maxTagTextLength = ref(10)
const options = ref<SelectProps['options']>([])
for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i
  options.value.push({
    label: `Long Label: ${value}`,
    value
  })
}
const value = ref(['a10', 'c12', 'h17', 'j19', 'k20', 'l44'])

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
          :model="formState"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          @finish="onFinish"
          :style="{height: '30vh', width: '30vw',}"
        >

          <a-space class="horizontalContain">

            <h1 class="titleSingleLine">
              查询范围
            </h1>

            <a-select
              v-model:value="value"
              mode="multiple"
              style="width: 100%"
              placeholder="Select Item..."
              :max-tag-text-length="maxTagTextLength"
              :options="options"
              :style="{marginLeft: '30px',marginRight:10,paddingRight:20}"
            ></a-select>

          </a-space>


          <div class="horizontalContain" :style="{marginLeft: '156px',marginRight:'20px',marginTop:'20px'}">

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit" @click="dialogFormVisible = true">添加查询范围</a-button>
            </a-form-item>


            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit">查询</a-button>
            </a-form-item>

          </div>

        </a-form>
      </a-layout-content>

      <!--  Root Content Layout  -->
    </a-layout>


    <!--  Root Layout  -->
  </a-layout>


  <!--The Range Dialog-->
  <el-dialog v-model="dialogFormVisible" title="添加查询范围" width="500">
    <el-form :model="form">

      <el-form-item label="From" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>

      <el-form-item label="To" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>


    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogConfirmAction">Confirm</el-button>
      </div>
    </template>
  </el-dialog>


</template>

<style>
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

