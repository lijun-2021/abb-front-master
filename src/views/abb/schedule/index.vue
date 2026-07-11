<template>
  <div style="width: 100%; height: 100%">
   <el-main class="main-content">
    <el-card class="search-card dashboard-card" shadow="never">
      <el-form :model="queryParams" label-width="90px" class="advanced-search-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="SN号" class="bold-label">
              <el-input v-model="queryParams.snCode" placeholder="请输入序列号" clearable prefix-icon="Search" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="功能状态" class="bold-label">
              <el-select v-model="queryParams.functionStatus" placeholder="请选择状态" clearable style="width: 100%;">
                <el-option label="未完成" :value="0" />
                <el-option label="进行中" :value="1" />
                <el-option label="已完成" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="员工姓名" class="bold-label">
              <el-input v-model="queryParams.functionEmpName" placeholder="请输入员工姓名" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isSearchExpand">
            <el-form-item label="检测区域" class="bold-label">
              <el-select v-model="queryParams.area" placeholder="请选择区域" clearable style="width: 100%;">
                <el-option v-for="a in ['500','K1','K2','A1','A2','A3','A4','A5','A6']" :key="a" :label="a" :value="a" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isSearchExpand">
            <el-form-item label="产线" class="bold-label">
              <el-input v-model="queryParams.productionLine" placeholder="请输入产线" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isSearchExpand">
            <el-form-item label="SN合同名称" class="bold-label">
              <el-input v-model="queryParams.snContract" placeholder="请输入合同名称" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isSearchExpand">
            <el-form-item label="需要FAT" class="bold-label">
              <el-select v-model="queryParams.fat" placeholder="请选择" clearable style="width: 100%;">
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="16" :lg="8" v-show="isSearchExpand">
            <el-form-item label="下线时间" class="bold-label">
              <el-date-picker
                v-model="queryParams.offlineTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24" class="search-buttons-container">
            <el-form-item label-width="0">
              <el-button type="primary" icon="Search" @click="handleQuery" class="abb-btn-danger">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-link type="primary" :icon="isSearchExpand ? 'ArrowUp' : 'ArrowDown'" @click="isSearchExpand = !isSearchExpand" style="margin-left: 12px; font-size: 13px;">
                {{ isSearchExpand ? '收起高级筛选' : '展开高级筛选' }}
              </el-link>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="table-card dashboard-card" shadow="never">
      <template #header>
        <div class="card-header abb-card-header">
          <span class="header-title"><i class="el-icon-list"></i> 待排程任务列表</span>
          
          <el-button 
            type="primary" 
            icon="Connection" 
            :disabled="selectedRows.length === 0"
            @click="openBatchModal" 
            class="batch-btn"
          >
            批量排程 {{ selectedRows.length > 0 ? `(已选 ${selectedRows.length} 台)` : '' }}
          </el-button>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border stripe style="width: 100%" 
        row-key="snCode" 
        class="abb-table" 
        header-cell-class-name="abb-table-header"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" fixed />

        <el-table-column type="expand">
            <template #default="scope">
                <div class="expand-detail">
                <div v-if="getNcrList(scope.row, 'h').length > 0" class="ncr-reason-box alert-box">
                  <el-alert 
                    v-for="(ncr, index) in getNcrList(scope.row, 'h')" 
                    :key="'h-'+index"
                    :title="`高压柜异常 ${index + 1} - 不合格原因：`" 
                    type="error" 
                    :description="ncr" 
                    show-icon 
                    :closable="false" 
                    style="margin-bottom: 8px;"
                 />
                </div>
                <div v-if="getNcrList(scope.row, 'l').length > 0" class="ncr-reason-box alert-box">
                  <el-alert 
                     v-for="(ncr, index) in getNcrList(scope.row, 'l')" 
                     :key="'l-'+index"
                     :title="`低压柜异常 ${index + 1} - 不合格原因：`" 
                     type="error" 
                     :description="ncr" 
                     show-icon 
                     :closable="false" 
                     style="margin-bottom: 8px;"
                  />
                </div>
                <div v-if="getNcrList(scope.row, 'h').length === 0 && getNcrList(scope.row, 'l').length === 0" class="empty-ncr">
                  <el-alert title="该柜无异常记录" type="success" show-icon :closable="false" plain/>
                </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="SN 编号" width="180" align="center" fixed>
          <template #default="scope">
            <span 
              :style="{ 
                color: (getNcrList(scope.row, 'h').length > 0 || getNcrList(scope.row, 'l').length > 0) ? '#f56c6c' : '#67c23a',
                fontWeight: 'bold'
              }"
            >
              {{ scope.row.snCode }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="snContract" label="合同名称" width="120" align="center" />
        
        <el-table-column label="挂证状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.certification === 1" type="success" effect="light">已挂证</el-tag>
            <el-tag v-else type="info" effect="plain">未挂证</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="productionLine" label="产线" width="100" align="center" />
        <el-table-column prop="offlineTime" label="耐压产出时间" width="160" align="center" sortable/>

        <el-table-column label="FAT" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.fat === 1" type="success" effect="dark" size="small">是</el-tag>
            <el-tag v-else-if="scope.row.fat === 0" type="info" effect="plain" size="small">否</el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>

        <el-table-column label="FAT 时间" width="150" align="center">
          <template #default="scope">
            <div v-if="scope.row.fatBeginT" style="font-size: 12px; line-height: 1.2;">
              <div>{{ scope.row.fatBeginT }}</div>
              <div style="color: #909399;">至</div>
              <div>{{ scope.row.fatEndT }}</div>
            </div>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>

        <el-table-column label="功能状态" width="100" align="center">
          <template #default="scope">
            <span :class="['table-status-badge', 
              scope.row.functionStatus === 2 ? 'status-done' : 
              scope.row.functionStatus === 1 ? 'status-doing' : 'status-todo'
            ]">
              {{ 
                scope.row.functionStatus === 2 ? '已完成' : 
                scope.row.functionStatus === 1 ? '进行中' : '未开始' 
              }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="功能检验区域" width="120" align="center">
          <template #default="scope">
            <el-select 
              v-model="scope.row.area" 
              size="small" 
              placeholder="请选择" 
              class="table-select" 
              @change="(val) => handleAreaChange(scope.row, val)"
            >
              <el-option v-for="a in ['500','K1','K2','A1','A2','A3','A4','A5','A6']" :key="a" :label="a" :value="a" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="功能检测员工" min-width="170" align="center">
          <template #default="scope">
            <div class="employee-cell">
              <el-input
                v-model="scope.row.functionEmpName"
                readonly
                placeholder="双击分配人员"
                class="click-input"
                @dblclick="openModal(scope.row)"
              >
                <template #suffix>
                  <el-icon class="el-input__icon"><User /></el-icon>
                </template>
              </el-input>
              <el-button
                v-if="scope.row.functionEmpName"
                type="danger"
                size="small"
                class="delete-btn"
                @click="removeEmployee(scope.row)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
   </el-main>

   <el-dialog v-model="dialogVisible" :title="isBatchMode ? '批量分配 - 人员任务调度看板' : '人员任务调度看板'" width="1100px" destroy-on-close class="abb-dialog">
    
    <div class="group-filter-bar">
      <span class="filter-label">选择组别：</span>
      <el-radio-group v-model="workerQueryParams.empTeam" @change="handleGroupChange" size="default">
        <el-radio-button label="">全部人员</el-radio-button>
        <el-radio-button label="A">A组</el-radio-button>
        <el-radio-button label="B">B组</el-radio-button>
        <el-radio-button label="C">C组</el-radio-button>
        <el-radio-button label="D">D组</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="workerList" border class="worker-table" header-cell-class-name="abb-table-header">
      <el-table-column label="员工姓名" width="130" align="center" fixed>
        <template #default="scope">
          <el-button type="primary" link class="worker-name-btn" @click="selectWorker(scope.row)">
            <el-icon><Avatar /></el-icon> {{ scope.row.EmpName }}
          </el-button>
          <div v-if="scope.row.empTeam" class="worker-group-tag">{{ scope.row.empTeam }}组</div>
        </template>
      </el-table-column>
      
      <el-table-column label="任务分配情况 (最多20个槽位)" min-width="600">
        <template #default="scope">
           <div class="task-slot-container">
             <div v-for="(task, index) in (scope.row.taskList as any[])" :key="index" class="task-slot-wrapper">
                <div 
                  v-if="task" 
                  :class="['modern-task-dot mini-dot', getTaskDotClass(task.status)]"
                  :title="task.snCode"
                >
                  <span class="sn-text">{{ task.snCode }}</span>
                </div>
                <div v-else class="empty-slot-mini" :title="`槽位 ${index + 1}`">
                  {{ index + 1 }}
                </div>
             </div>
           </div>
       </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="workerQueryParams.pageNum"
        v-model:page-size="workerQueryParams.pageSize"
        :page-sizes="[10, 20, 50]"
        background
        layout="total, prev, pager, next"
        :total="workerTotal"
        @size-change="handleWorkerSizeChange"
        @current-change="handleWorkerCurrentChange"
      />
    </div>

    <template #footer>
      <div class="legend-bar-container">
        <span class="legend-title">状态图例：</span>
        <div class="legend-items">
          <span><i class="dot-base done-solid"></i> 已完成</span>
          <span><i class="dot-base doing-solid"></i> 进行中</span>
          <span><i class="dot-base todo-solid"></i> 未开始</span>
          <span><i class="dot-base empty-solid"></i> 无任务</span>
        </div>
      </div>
    </template>
   </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Calendar, Search, Refresh, CircleCheck, User, Avatar, List, Close, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 假设这些方法已经在 api/abb/schedule-api 中定义
import { getScheduleList, getWorkerTasks, batchUpdateScheduleAssign } from '@/api/abb/schedule-api'

// 1. 🌟 别忘了在顶部引入图标
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

// 2. 🌟 新增一个响应式变量，用来控制展开/收起状态
const isSearchExpand = ref(false)

// 3. 🌟 扩展查询参数，严格对齐后端字段
const queryParams = reactive({ 
  pageNum: 1,
  pageSize: 10,
  snCode: '',                                 // SN号
  productionLine: '',                         // 产线
  area: '',                                   // 检测区域
  offlineTime: null as string[] | null,      // 下线时间范围（Element日期范围绑定为数组）
  functionEmpName: '',                        // 员工姓名
  functionStatus: null as number | null,     // 功能检测状态 (0,1,2)
  fat: null as number | null,                // 是否需要FAT (0,1)
  snContract: ''                              // SN合同号
})

// 4. 🌟 重置查询条件：把所有新增的字段全都恢复初始化
const resetQuery = () => {
  queryParams.snCode = ''
  queryParams.productionLine = ''
  queryParams.area = ''
  queryParams.offlineTime = null              // 日期重置为 null
  queryParams.functionEmpName = ''
  queryParams.functionStatus = null
  queryParams.fat = null
  queryParams.snContract = ''
  
  queryParams.pageNum = 1                     // 重置页码
  fetchTableData()                            // 重新触发查询刷新表格
}


const total = ref(0) 

// 看板参数增加 empTeam
const workerQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  empTeam: '' 
})
const workerTotal = ref(0) 
const dialogVisible = ref(false)
const activeRow = ref<any>(null)

const selectedRows = ref<any[]>([]) 
const isBatchMode = ref(false) 

const getNcrList = (row: any, prefix: string) => {
  const targetPrefix = `${prefix}NcrDescription`; 
  return Object.keys(row)
    .filter(key => key.startsWith(targetPrefix))
    .sort((a, b) => {
      const numA = parseInt(a.replace(targetPrefix, '')) || 0;
      const numB = parseInt(b.replace(targetPrefix, '')) || 0;
      return numA - numB;
    })
    .map(key => row[key])
    .filter(val => val && String(val).trim() !== '');
};

const getTaskDotClass = (statusCode: number) => {
  if (statusCode === 2) return 'task-done-solid'    
  if (statusCode === 1) return 'task-doing-solid'   
  if (statusCode === 0) return 'task-todo-solid'    
  return ''
}

const tableData = ref<any[]>([])
const workerList = ref<any[]>([])

const fetchTableData = async () => {
  try {
    const res: any = await getScheduleList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      snCode: queryParams.snCode 
    })
    const list = res.list || res.data?.list || res.data?.rows || res.data || res
    tableData.value = Array.isArray(list) ? list : []
    total.value = res.total || res.data?.total || 0
  } catch (error) {
    console.error('获取排程列表异常:', error)
  }
}

const fetchWorkerList = async () => {
  try {
    const res: any = await getWorkerTasks({
      pageNum: workerQueryParams.pageNum,
      pageSize: workerQueryParams.pageSize,
      empTeam: workerQueryParams.empTeam // 传递组别参数给后端
    }) 
    
    let rawData = res.list || res.data?.list || res.data?.rows || res.data || res
    if (!Array.isArray(rawData) && rawData.list) {
      rawData = rawData.list
    }
    const workerArray = Array.isArray(rawData) ? rawData : []
    workerTotal.value = res.total || res.data?.total || 0

    workerList.value = workerArray.map((worker: any) => {
      const tasks = []
      // 循环 20 次解析后端返回的 snCode1 到 snCode20
      for (let i = 1; i <= 20; i++) {
        const sn = worker[`snCode${i}`] 
        if (sn) {
          const matchedRow = tableData.value.find(item => item.snCode === sn)
          let taskStatus = 1 
          if (matchedRow) {
            if (matchedRow.functionStatus === 2) {
              taskStatus = 2
            } else if (matchedRow.functionStatus === 1 || (matchedRow.functionStatus === 0 && matchedRow.functionEmpName)) {
              taskStatus = 1
            } else {
              taskStatus = 0
            }
          }
          tasks.push({ snCode: sn, status: taskStatus }) 
        } else {
          tasks.push(null) 
        }
      }
      return {
        ...worker,               
        EmpName: worker.empName, 
        EmpId: worker.empId,
        empTeam: worker.empTeam, // 接住后端的组别     
        taskList: tasks          
      }
    })
  } catch (error) {
    console.error('获取人员看板异常:', error)
  }
}

onMounted(() => {
  fetchTableData()
})

// 组别切换，重置页码并查询
const handleGroupChange = () => {
  workerQueryParams.pageNum = 1
  fetchWorkerList()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const openModal = (row: any) => {
  isBatchMode.value = false 
  activeRow.value = row
  fetchWorkerList()
  dialogVisible.value = true
}

const openBatchModal = () => {
  isBatchMode.value = true 
  fetchWorkerList()
  dialogVisible.value = true
}

// 统一的无感保存分配逻辑
const selectWorker = async (workerRow: any) => {
  const empName = workerRow.EmpName || workerRow.empName || ''

  if (isBatchMode.value) {
    const ids = selectedRows.value.map(r => r.id)
    const names = selectedRows.value.map(() => empName)
    const areas = selectedRows.value.map(r => r.area || '')

    try {
      await batchUpdateScheduleAssign({
        ids: ids,
        functionEmpNames: names,
        areas: areas
      })
      ElMessage.success(`成功为 ${ids.length} 台设备批量分配员工：${empName}`)
      dialogVisible.value = false
      fetchTableData()
    } catch (error) {
      ElMessage.error('批量分配失败，请重试')
    }
  } else {
    if (!activeRow.value) return
    const row = activeRow.value
    const oldName = row.functionEmpName
    row.functionEmpName = empName

    try {
      await batchUpdateScheduleAssign({
        ids: [row.id],
        functionEmpNames: [row.functionEmpName],
        areas: [row.area || '']
      })
      ElMessage.success(`设备 ${row.snCode} 成功分配给：${empName}`)
      dialogVisible.value = false
    } catch (error) {
      row.functionEmpName = oldName
      ElMessage.error('分配失败，已回退数据')
    }
  }
}

// 无感删除分配
const removeEmployee = async (row: any) => {
  const oldName = row.functionEmpName
  const oldArea = row.area
  row.functionEmpName = '';
  row.area = '';

  try {
    await batchUpdateScheduleAssign({
      ids: [row.id],
      functionEmpNames: [''], 
      areas: ['']
    })
    ElMessage.success('已清空该设备的人员和区域分配')
  } catch(error) {
    row.functionEmpName = oldName
    row.area = oldArea
    ElMessage.error('清空失败，已回退数据')
  }
}

// 无感修改区域
const handleAreaChange = async (row: any, newVal: string) => {
  try {
    await batchUpdateScheduleAssign({
      ids: [row.id],
      functionEmpNames: [row.functionEmpName || ''],
      areas: [newVal]
    })
    ElMessage.success('区域更新成功')
  } catch (error) {
    ElMessage.error('区域更新失败，正在刷新数据')
    fetchTableData() 
  }
}

const handleQuery = () => fetchTableData()


const handleSizeChange = (newSize: number) => { queryParams.pageSize = newSize; fetchTableData() }
const handleCurrentChange = (newPage: number) => { queryParams.pageNum = newPage; fetchTableData() }
const handleWorkerSizeChange = (newSize: number) => { workerQueryParams.pageSize = newSize; fetchWorkerList() }
const handleWorkerCurrentChange = (newPage: number) => { workerQueryParams.pageNum = newPage; fetchWorkerList() }
</script>

<style scoped>
.main-content { padding: 24px; background-color: #f4f6f9; min-height: calc(100vh - 64px); }
.dashboard-card { border-radius: 8px; border: none; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05) !important; margin-bottom: 20px; transition: all 0.3s; }
.dashboard-card:hover { box-shadow: 0 4px 16px 0 rgba(0,0,0,0.1) !important; }
.bold-label :deep(.el-form-item__label) { font-weight: bold; color: #303133; }
.custom-input :deep(.el-input__wrapper) { border-radius: 20px; padding-left: 15px; }
.abb-btn-danger { background-color: #ff0000; border-color: #ff0000; color: #fff; font-weight: bold; border-radius: 20px; padding: 10px 20px; transition: all 0.3s; }
.abb-btn-danger:hover, .abb-btn-danger:focus { background-color: #e60000; border-color: #e60000; opacity: 0.9; transform: translateY(-1px); }
.abb-card-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
.header-title { font-size: 18px; font-weight: bold; color: #303133; display: flex; align-items: center; gap: 8px; }

.batch-btn { border-radius: 20px; font-weight: bold; transition: all 0.3s; }
.batch-btn:disabled { opacity: 0.6; }

.abb-table { border-radius: 8px; overflow: hidden; }
:deep(.abb-table-header) { background-color: #f5f7fa !important; color: #606266; font-weight: bold; text-align: center; }
:deep(.el-table__row) { transition: all 0.2s; }
:deep(.el-table__row:hover > td) { background-color: #ecf5ff !important; }
.expand-detail { padding: 15px 50px; background-color: #fafafa; border-radius: 4px; }
.alert-box { margin: 5px 0; }
.table-status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
.status-todo { background-color: #fef0f0; color: #f56c6c; border: 1px solid #fbc4c4; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }
.status-doing { background-color: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }
.status-done { background-color: #f0f9eb; color: #67C23A; border: 1px solid #c2e7b0; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }
.table-select :deep(.el-input__wrapper) { border-radius: 15px; }
.click-input :deep(.el-input__wrapper) { cursor: pointer; border-radius: 15px; transition: all 0.3s; }
.click-input :deep(.el-input__wrapper):hover { border-color: #ff0000; background-color: #fff1f1; }
.click-input :deep(.el-input__inner) { cursor: pointer; font-weight: bold; color: #ff0000; }
.employee-cell { display: flex; align-items: center; gap: 8px; }
.delete-btn { padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.delete-btn:hover { background-color: #ff4444; transform: scale(1.1); }
:deep(.abb-dialog) { border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
:deep(.abb-dialog .el-dialog__header) { background-color: #f5f7fa; margin-right: 0; padding: 20px 25px; border-bottom: 1px solid #dcdfe6; }
:deep(.abb-dialog .el-dialog__title) { font-weight: bold; color: #303133; font-size: 20px; }
.worker-table { margin: 10px 0; }
.worker-name-btn { font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 4px; }
.worker-name-btn:hover { text-decoration: underline; transform: scale(1.05); }

/* 组别和 20槽位 样式 */
.group-filter-bar { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; background-color: #f5f7fa; padding: 10px 15px; border-radius: 8px; }
.filter-label { font-size: 14px; font-weight: bold; color: #606266; }
.worker-group-tag { font-size: 12px; color: #909399; margin-top: 4px; }
.task-slot-container { display: flex; flex-wrap: wrap; gap: 8px; padding: 5px 0; }
.task-slot-wrapper { display: inline-block; }
.mini-dot { width: 80px; height: 28px; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.15); position: relative; overflow: hidden;}
.mini-dot .sn-text { font-size: 10px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-dot::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 70%); transition: all 0.6s; transform: translateX(-100%); }
.mini-dot:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 5px 15px rgba(0,0,0,0.25); }
.mini-dot:hover::after { transform: translateX(100%); }
.empty-slot-mini { width: 80px; height: 28px; border: 1px dashed #dcdfe6; border-radius: 6px; background-color: #fafafa; display: flex; align-items: center; justify-content: center; color: #c0c4cc; font-size: 12px; font-weight: bold; transition: all 0.3s; }
.empty-slot-mini:hover { border-color: #a0cfff; color: #409eff; background-color: #ecf5ff; }

/* 状态色 */
.task-done-solid { background: linear-gradient(145deg, #67C23A, #58a531); border: none; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15); }
.task-doing-solid { background: linear-gradient(145deg, #E6A23C, #c98c33); border: none; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15); }
.task-todo-solid { background: linear-gradient(145deg, #F56C6C, #d65959); border: none; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15); }

.legend-bar-container { display: flex; align-items: center; justify-content: flex-end; gap: 15px; padding: 10px 25px; background-color: #fafafa; border-top: 1px solid #dcdfe6; }
.legend-title { font-size: 13px; color: #909399; font-weight: bold; }
.legend-items { display: flex; align-items: center; gap: 18px; font-size: 13px; color: #606266; }
.dot-base { width: 10px; height: 10px; border-radius: 50%; display: inline-block; position: relative; top: 1px; }
.done-solid { background-color: #67C23A; border: 1px solid #58a531; }
.doing-solid { background-color: #E6A23C; border: 1px solid #c98c33; }
.todo-solid { background-color: #F56C6C; border: 1px solid #d65959; }
.empty-solid { background-color: #fafafa; border: 1px solid #dcdfe6; }
</style>