<template>
  <div
    id="app"
    class="flex w-full"
  >
    <div
      class="flex justify-between w-full"
    >
      <Sidebar
        ref="sidebar"
        class="flex-none bg-gray-700 text-gray-50 text-md px-2 pt-2 w-1/5 h-screen sticky top-0"
      />
      <div class="flex flex-auto w-auto">
        <div class="flex flex-col">
          <router-view @sidebar-click="onSidebarClick" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import './index.css';
import Sidebar from './components/sidebar/SidebarPage.vue';
import {ref} from 'vue';
import {log} from './utils/loggger';

Object.assign(console, log.functions);

export default {
  name: 'App',
  components: {
    Sidebar,
  },
  setup() {
    const sidebar = ref(null);

    function onSidebarClick(id) {
      sidebar.value.onRouterClick(id);
    }

    return {sidebar, onSidebarClick};
  },
};

//测试日志
console.log('Started.');

</script>

