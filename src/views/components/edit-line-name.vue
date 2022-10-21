<template>
  <el-dialog title="编辑线路名称" :visible.sync="dialogVisible" width="30%">
    <div class="md">
      <label>线路名称：</label>
      <el-input v-model="linename" placeholder="请输入线路名称"></el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      linename: '',
      dialogVisible: false,
      mesh: null
    }
  },
  methods: {
    dy_show(mesh, name) {
      this.mesh = mesh
      this.linename = name
      this.dialogVisible = true
    },
    handleConfirm() {
      this.dialogVisible = false
      if (this.mesh) {
        this.mesh.name = this.linename
      } else {
        this.$emit('eventSave', this.linename)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.md{
  display: flex;
  align-items: center;
  label{
    width: 100px;
  }
}
</style>
