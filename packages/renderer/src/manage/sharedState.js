import {reactive, ref} from 'vue';

// 创建一个响应式状态对象
const state = reactive({
  isLoading: false,
  appendedLogHtml: '',
});

export function setLoading(value) {
  state.isLoading = value;
}

export function setAppendedLogHtml(html) {
  state.appendedLogHtml = html;
}

// 导出状态，以便在组件中使用
export function useSharedState() {
  return state;
}
