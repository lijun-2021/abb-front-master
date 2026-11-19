<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="产线" prop="line">
          <el-input
            v-model="queryParams.line"
            placeholder="请输入产线名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="工位行" prop="rowId">
          <el-input
            v-model="queryParams.rowId"
            placeholder="请输入工位行 ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="电压区域" prop="voltageZone">
          <el-input
            v-model="queryParams.voltageZone"
            placeholder="请输入电压区域"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="作业人员" prop="worker">
          <el-input
            v-model.number="queryParams.worker"
            placeholder="请输入人员编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="功能区域" prop="functionZone">
          <el-input
            v-model="queryParams.functionZone"
            placeholder="请输入功能区域"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="检验员" prop="inspector">
          <el-input
            v-model="queryParams.inspector"
            placeholder="请输入检验员编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--title">算法自动排程结果</div>
        <el-button icon="Refresh" :loading="loading" @click="fetchResultList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="pageData" border stripe class="data-table__content">
        <el-table-column type="index" label="SN号" width="70" align="center" />
        <el-table-column label="产线" prop="line" min-width="120" align="center" />
        <el-table-column label="合同号" prop="rowId" min-width="140" align="center" />
        <el-table-column label="耐压区域" prop="voltageZone" min-width="110" align="center" />
        <el-table-column label="耐压检测员工编号" prop="worker" min-width="140" align="center" />
        <el-table-column label="功能区域" prop="functionZone" min-width="120" align="center" />
        <el-table-column label="功能检验员工" prop="inspector" min-width="120" align="center" />
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchResultList"
      />
      <el-empty v-else-if="!loading" description="暂无算法排程结果" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { AlgorithmSimulAPI } from "@/api/abb/algorithmsimul-api";
import type { AlgorithmSimulQuery, AlgorithmSimulRecord } from "@/api/abb/algorithmsimul-api";

const loading = ref(false);
const total = ref(0);
const pageData = ref<AlgorithmSimulRecord[]>([]);
const queryFormRef = ref();
const queryParams = reactive<AlgorithmSimulQuery>({
  pageNum: 1,
  pageSize: 10,
  line: undefined,
  rowId: undefined,
  voltageZone: undefined,
  worker: undefined,
  functionZone: undefined,
  inspector: undefined,
});

const fetchResultList = async () => {
  loading.value = true;
  try {
    const response = await AlgorithmSimulAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchResultList();
};

const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchResultList();
};

onMounted(fetchResultList);
</script>

<style scoped>
.data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.data-table__toolbar--title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.data-table__content {
  width: 100% !important;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
