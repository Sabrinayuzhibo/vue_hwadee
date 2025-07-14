<template>
  <el-menu 
    class="side-menu"
    :default-active="activeMenu"
    router
    unique-opened
    background-color="#001529"
    text-color="#fff"
    active-text-color="#ffd04b">
    <template v-for="item in menus" :key="item.path">
      <el-menu-item :index="item.path">
        <el-icon>
          <component :is="item.icon"/>
        </el-icon>
        <span>{{ item.cname }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
defineProps({
  menus: {
    type: Array,
    required: true
  },
  activeMenu: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.side-menu {
  width: 240px;
  height: calc(100vh - 120px);
  border-right: 1px solid #e8e8e8;
}
</style>
