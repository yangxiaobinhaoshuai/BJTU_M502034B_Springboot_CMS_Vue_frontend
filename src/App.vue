<script lang="ts" setup>
import { reactive, ref } from 'vue'

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
const onFinish = (values: any) => {
  console.log('Success:', values)
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}

const dialogFormVisible = ref(false)

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

const gridData = [
  {
    date: '2016-05-02',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District'
  },
  {
    date: '2016-05-04',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District'
  },
  {
    date: '2016-05-01',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District'
  },
  {
    date: '2016-05-03',
    name: 'John Smith',
    address: 'No.1518,  Jinshajiang Road, Putuo District'
  }
]

</script>

<template>
  <a-layout>
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
          @finishFailed="onFinishFailed"
          :style="{height: '30vh', width: '30vw',}"
        >
          <a-typography-text :style="{marginLeft: '200px',marginRight:'20px'}">
            查询范围
          </a-typography-text>

          <div class="horizontalContain" :style="{marginLeft: '156px',marginRight:'20px',marginTop:'20px'}">

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit" @click="dialogFormVisible = true">添加查询范围</a-button>
            </a-form-item>


            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit" @click="dialogFormVisible = true">历史记录</a-button>
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit">查询</a-button>
            </a-form-item>
          </div>

        </a-form>
      </a-layout-content>
    </a-layout>
  </a-layout>

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
        <el-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
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
</style>

