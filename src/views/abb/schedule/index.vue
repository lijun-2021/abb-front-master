<template>
  <div style="width: 100%; height: 100%">
   <el-main class="main-content">
    <el-card class="search-card dashboard-card" shadow="never">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="SN号" class="bold-label">
          <el-input v-model="queryParams.snCode" placeholder="请输入序列号" clearable prefix-icon="Search" class="custom-input"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery" class="abb-btn-danger">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card dashboard-card" shadow="never">
      <template #header>
        <div class="card-header abb-card-header">
          <span class="header-title"><i class="el-icon-list"></i> 待排程任务列表</span>
          <el-button type="success" plain icon="CircleCheck" @click="handleSave" class="save-btn">
            提交更改
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe style="width: 100%" row-key="snCode" class="abb-table" header-cell-class-name="abb-table-header">
        
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
        
        

        <el-table-column label="SN 编号" width="200" align="center" fixed>
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


        <el-table-column prop="productionLine" label="产线" width="130" align="center" />
        <el-table-column prop="offlineTime" label="耐压产出时间" width="160" align="center" sortable/>

        <el-table-column label="FAT" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.fat === 1" type="success" effect="dark" size="small">是</el-tag>
            
            <el-tag v-else-if="scope.row.fat === 0" type="info" effect="plain" size="small">否</el-tag>
            
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>

        <el-table-column label="功能状态" width="120" align="center">
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

        <el-table-column label="功能检验区域" width="140" align="center">
          <template #default="scope">
            <el-select v-model="scope.row.area" size="small" placeholder="请选择" class="table-select" @change="trackChange(scope.row)">
              <el-option v-for="a in ['K1','K2','A1','A2','A3','A4','A5','A6']" :key="a" :label="a" :value="a" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="功能检测员工姓名" min-width="170" align="center">
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

   <el-dialog v-model="dialogVisible" title="人员任务调度看板" width="1100px" destroy-on-close class="abb-dialog">
    <el-table :data="workerList" border class="worker-table" header-cell-class-name="abb-table-header">
      <el-table-column label="员工姓名" width="120" align="center" fixed>
        <template #default="scope">
          <el-button type="primary" link class="worker-name-btn" @click="selectWorker(scope.row)">
            <el-icon><Avatar /></el-icon> {{ scope.row.EmpName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column v-for="n in 7" :key="n" :label="`任务槽位 ${n}`" align="center" min-width="130">
        <template #default="scope">
           <div 
             v-if="scope.row.taskList[n-1]" 
             :class="['modern-task-dot', getTaskDotClass(scope.row.taskList[n-1].status)]"
             :title="scope.row.taskList[n-1].snCode"
           >
             <span class="sn-text">{{ scope.row.taskList[n-1].snCode }}</span>
           </div>
           <div v-else class="empty-slot">-</div>
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
import { Calendar, Search, Refresh, CircleCheck, User, Avatar, List, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 🌟 1. 引入你写好的 API 请求函数
import { getScheduleList, getWorkerTasks, ScheduleRecord, batchUpdateScheduleAssign,BatchUpdatePayload} from '@/api/abb/schedule-api'

// 🌟 替换原来的 queryParams，加上分页参数
const queryParams = reactive({ 
  snCode: '',
  pageNum: 1,
  pageSize: 10 
})
const total = ref(0) // 主表总条数

// 🌟 新增：人员看板的分页参数
const workerQueryParams = reactive({
  pageNum: 1,
  pageSize: 10
})
const workerTotal = ref(0) // 人员总条数
const dialogVisible = ref(false)
const activeRow = ref<any>(null)

// 提取并过滤动态数量的 NCR 记录
// 参数 prefix 传 'h' 代表高压，传 'l' 代表低压
// 🌟 给 row 穿上 ScheduleRecord 的衣服
const getNcrList = (row: ScheduleRecord, prefix: string) => {
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

// 看板弹窗样式转化函数 (0:红/Todo, 1:黄/Doing, 2:绿/Done)
const getTaskDotClass = (statusCode: number) => {
  if (statusCode === 2) return 'task-done-solid'    
  if (statusCode === 1) return 'task-doing-solid'   
  if (statusCode === 0) return 'task-todo-solid'    
  return ''
}

const tableData = ref<any[]>([])
const workerList = ref<any[]>([])

// 🌟 2. 请求主表格数据

const fetchTableData = async () => {
  try {
    const res: any = await getScheduleList({
      pageNum: queryParams.pageNum,   // 动态读取当前页
      pageSize: queryParams.pageSize, // 动态读取每页条数
      snCode: queryParams.snCode 
    })

    const list = res.list || res.data?.list || res.data?.rows || res.data || res
    tableData.value = Array.isArray(list) ? list : []

    
    
    // 🌟 核心：接住后端返回的数组
    
    // 🌟 核心：接住后端返回的总条数（可能是 res.total 或 res.data.total）
    total.value = res.total || res.data?.total || 0
  } catch (error) {
    console.error('获取排程列表异常:', error)
  }
}

// 🌟 3. 请求人员任务看板数据 (包含终极跨表关联逻辑)
// 核心思路：后端接口直接返回分页后的人员列表 + 每个人对应的 7 个任务槽位的 SN 号。前端拿到这个数据后，再根据主表格的数据状态，映射出每个任务槽位的状态（绿/黄/红）。
const fetchWorkerList = async () => {
  try {
    // 把分页参数传给获取人员的接口
    const res: any = await getWorkerTasks({
      pageNum: workerQueryParams.pageNum,
      pageSize: workerQueryParams.pageSize
    }) 
    
    let rawData = res.list || res.data?.list || res.data?.rows || res.data || res
    if (!Array.isArray(rawData) && rawData.list) {
      rawData = rawData.list
    }
    const workerArray = Array.isArray(rawData) ? rawData : []

    // 🌟 核心：接住后端返回的人员总条数 (你那 43 条的真相就在这里)
    workerTotal.value = res.total || res.data?.total || 0

    // ... 下面的 workerList.value = workerArray.map(...) 保持原样不动！

    // 组装平铺字段并映射状态
    workerList.value = workerArray.map((worker: any) => {
      const tasks = []
      for (let i = 1; i <= 7; i++) {
        const sn = worker[`snCode${i}`] 
        
        if (sn) {
          const matchedRow = tableData.value.find(item => item.snCode === sn)
          let taskStatus = 1 // 兜底：进行中
          
          if (matchedRow) {
            if (matchedRow.functionStatus === 2) {
              // 主表 2(已完成) -> 看板 2(绿框)
              taskStatus = 2
            } else if (matchedRow.functionStatus === 1 || (matchedRow.functionStatus === 0 && matchedRow.functionEmpName)) {
              // 主表 1(进行中) 或者 (主表0但已分人) -> 看板 1(黄框)
              taskStatus = 1
            } else {
              // 主表 0(未完成) 且没分人 -> 看板 0(红框)
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
        taskList: tasks          
      }
    })

  } catch (error) {
    console.error('获取人员看板异常:', error)
  }
}

// 初始化
onMounted(() => {
  fetchTableData()
})

// 打开弹窗并刷新最新看板
const openModal = (row: any) => {
  activeRow.value = row
  fetchWorkerList()
  dialogVisible.value = true
}

// 选中员工
const selectWorker = (workerRow: any) => {
  if (!activeRow.value) return
  const empName = workerRow.EmpName || workerRow.empName || ''
  activeRow.value.functionEmpName = empName
  //activeRow.value.functionEmpId = workerRow.EmpId
  dialogVisible.value = false
  ElMessage.success(`成功分配员工：${empName}`)
  trackChange(activeRow.value) // 🌟 核心：通知备忘录，这行被改了！
}

// 删除员工分配
const removeEmployee = (row: any) => {
  row.functionEmpName = '';
  row.area = ""
  trackChange(row)// 🌟 核心：通知备忘录，这行被改了！
  ElMessage.success('已删除员工分配')
}

// 搜索
const handleQuery = () => {
  fetchTableData()
}

// 重置
const resetQuery = () => {
  queryParams.snCode = ''
  fetchTableData()
}

// 提交保存
/*const handleSave = async () => {
  if (!activeRow.value || !activeRow.value.id) {
    return ElMessage.warning('请先双击分配功能员或修改区域后再提交')
  }

  try {
    await updateScheduleAssign({
      id: activeRow.value.id,
      functionEmpName: activeRow.value.functionEmpName,
      area: activeRow.value.area
    })

    ElMessage.success('排程分配已成功保存至服务器！')
    fetchTableData() // 保存后刷新主表
    activeRow.value = null
  } catch (error) {
    console.error('保存请求异常:', error)
  }
}*/
// 假设你有一个数组存着你要提交的多行数据（比如通过 el-table 的 selection-change 获取的选中行）
// const selectedRows = ref([]) 

// 专门记录被修改过的行
const modifiedRows = ref<any[]>([])

// 自动追踪函数：只要行数据被动过，就把它塞进备忘录
const trackChange = (row: any) => {
  // 先查一下备忘录里是不是已经有这行了，避免重复添加
  const exists = modifiedRows.value.find(item => item.id === row.id)
  if (!exists) {
    modifiedRows.value.push(row)
  }
}



const handleSave = async () => {
  // 1. 拦截空操作
  if (modifiedRows.value.length === 0) {
    return ElMessage.warning('您还没有进行任何修改')
  }

  // 2. 准备后端需要的“三个大数组”
  const payload: {
    ids: any[];
    functionEmpNames: string[];
    areas: string[];
  } = {
    ids: [],
    functionEmpNames: [],
    areas: []
  }

  // 3. 遍历咱们的备忘录
  modifiedRows.value.forEach(row => {
    payload.ids.push(row.id)
    payload.functionEmpNames.push(row.functionEmpName || "")
    payload.areas.push(row.area || "")
  })

  try {
    await batchUpdateScheduleAssign(payload) 
    ElMessage.success(`成功保存了 ${modifiedRows.value.length} 个员工分配！`)
    fetchTableData() 
    
    // 4. 🌟 保存成功后，清空备忘录，准备迎接下一波修改
    modifiedRows.value = [] 
  } catch (error) {
    console.error('批量保存异常:', error)
  }
}

// ================= 🌟 新增分页切换事件 =================

// 1. 主表切换“每页几条”
const handleSizeChange = (newSize: number) => {
  queryParams.pageSize = newSize
  fetchTableData()
}
// 2. 主表切换“页码”
const handleCurrentChange = (newPage: number) => {
  queryParams.pageNum = newPage
  fetchTableData()
}

// 3. 看板切换“每页几条”
const handleWorkerSizeChange = (newSize: number) => {
  workerQueryParams.pageSize = newSize
  fetchWorkerList()
}
// 4. 看板切换“页码”
const handleWorkerCurrentChange = (newPage: number) => {
  workerQueryParams.pageNum = newPage
  fetchWorkerList()
}


</script>

<style scoped>
/* ============================================================ */
/* ===================== 全局 & 通用样式 ===================== */
/* ============================================================ */
.main-content { padding: 24px; background-color: #f4f6f9; min-height: calc(100vh - 64px); }

.dashboard-card { border-radius: 8px; border: none; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05) !important; margin-bottom: 20px; transition: all 0.3s; }
.dashboard-card:hover { box-shadow: 0 4px 16px 0 rgba(0,0,0,0.1) !important; }

.bold-label :deep(.el-form-item__label) { font-weight: bold; color: #303133; }
.custom-input :deep(.el-input__wrapper) { border-radius: 20px; padding-left: 15px; }

.abb-btn-danger { background-color: #ff0000; border-color: #ff0000; color: #fff; font-weight: bold; border-radius: 20px; padding: 10px 20px; transition: all 0.3s; }
.abb-btn-danger:hover, .abb-btn-danger:focus { background-color: #e60000; border-color: #e60000; opacity: 0.9; transform: translateY(-1px); }

/* ============================================================ */
/* ===================== 主表格区样式 ======================== */
/* ============================================================ */
.abb-card-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
.header-title { font-size: 18px; font-weight: bold; color: #303133; display: flex; align-items: center; gap: 8px; }
.save-btn { border-radius: 20px; font-weight: bold; }

.abb-table { border-radius: 8px; overflow: hidden; }
:deep(.abb-table-header) { background-color: #f5f7fa !important; color: #606266; font-weight: bold; text-align: center; }
:deep(.el-table__row) { transition: all 0.2s; }
:deep(.el-table__row:hover > td) { background-color: #ecf5ff !important; }

.expand-detail { padding: 15px 50px; background-color: #fafafa; border-radius: 4px; }
.alert-box { margin: 5px 0; }

/* 🌟 主表格完成状态 - 立体 Tag 风格 */
.table-status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
.status-todo { background-color: #fef0f0; color: #f56c6c; border: 1px solid #fbc4c4; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }
.status-doing { background-color: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }
.status-done { background-color: #f0f9eb; color: #67C23A; border: 1px solid #c2e7b0; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8); }

.table-select :deep(.el-input__wrapper) { border-radius: 15px; }

.click-input :deep(.el-input__wrapper) { cursor: pointer; border-radius: 15px; transition: all 0.3s; }
.click-input :deep(.el-input__wrapper):hover { border-color: #ff0000; background-color: #fff1f1; }
.click-input :deep(.el-input__inner) { cursor: pointer; font-weight: bold; color: #ff0000; }

/* 员工分配单元格样式 */
.employee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: #ff4444;
  transform: scale(1.1);
}

/* ============================================================ */
/* ===================== 弹窗看板区样式 ====================== */
/* ============================================================ */
:deep(.abb-dialog) { border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
:deep(.abb-dialog .el-dialog__header) { background-color: #f5f7fa; margin-right: 0; padding: 20px 25px; border-bottom: 1px solid #dcdfe6; }
:deep(.abb-dialog .el-dialog__title) { font-weight: bold; color: #303133; font-size: 20px; }

.worker-table { margin: 10px 0; }
.worker-name-btn { font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 4px; }
.worker-name-btn:hover { text-decoration: underline; transform: scale(1.05); }

/* 🌟 看板完成状态 - 立体、果冻感的实心块，自带呼吸灯效果 */
.modern-task-dot {
  padding: 8px 12px;
  border-radius: 8px; 
  color: #fff; 
  cursor: pointer;
  transition: all 0.3s ease;
  width: 110px; 
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15); 
  position: relative;
  overflow: hidden;
}

.modern-task-dot::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 70%);
  transition: all 0.6s;
  transform: translateX(-100%);
}

.modern-task-dot:hover {
  transform: translateY(-2px) scale(1.03); 
  box-shadow: 0 5px 15px rgba(0,0,0,0.25); 
}
.modern-task-dot:hover::after {
  transform: translateX(100%); 
}

.sn-text {
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
}

/* 颜色定义 */
.task-done-solid {
  background: linear-gradient(145deg, #67C23A, #58a531);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15); 
}
.task-doing-solid {
  background: linear-gradient(145deg, #E6A23C, #c98c33);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15);
}
.task-todo-solid {
  background: linear-gradient(145deg, #F56C6C, #d65959);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15);
}

.empty-slot { color: #dcdfe6; font-size: 12px; }

/* 图例栏 */
.legend-bar-container { display: flex; align-items: center; justify-content: flex-end; gap: 15px; padding: 10px 25px; background-color: #fafafa; border-top: 1px solid #dcdfe6; }
.legend-title { font-size: 13px; color: #909399; font-weight: bold; }
.legend-items { display: flex; align-items: center; gap: 18px; font-size: 13px; color: #606266; }
.dot-base { width: 10px; height: 10px; border-radius: 50%; display: inline-block; position: relative; top: 1px; }
.done-solid { background-color: #67C23A; border: 1px solid #58a531; }
.doing-solid { background-color: #E6A23C; border: 1px solid #c98c33; }
.todo-solid { background-color: #F56C6C; border: 1px solid #d65959; }
.empty-solid { background-color: #fafafa; border: 1px solid #dcdfe6; }
</style>