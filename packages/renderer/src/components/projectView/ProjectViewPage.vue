<script setup> import {ref, watch} from 'vue';
import {store} from '#preload';

const iframe = ref(null);
const loadingMessage = ref(null);
const editButton = ref(null);
const errorMessage = ref(null);
const previewPortValue = ref(null);
const previewPortInput = ref(null);
const isSuccess = ref(false);
const intervalId = ref(null);

const projectRunOnDevPort = ref(store.get('projectRunOnDevPort'));

watch(() => projectRunOnDevPort.value, (newValue) => {
  if (newValue) {
    previewPortValue.value.textContent = newValue;
  }
});

function iframeLoaded() {
  loadingMessage.value.style.display = 'none';
  editButton.value.style.backgroundColor = '#4CAF50';
  errorMessage.value.style.display = 'none';
  isSuccess.value = true;
}

function iframeError() {
  loadingMessage.value.style.display = 'none';
  errorMessage.value.style.display = 'block';
  editButton.value.style.backgroundColor = '#dc3545';
  isSuccess.value = false;
  intervalId.value = setInterval(() => {
    if (!isSuccess.value) {
      refreshIframe();
    } else {
      clearInterval(intervalId.value);
      iframeLoaded();
    }
  }, 2000);
}

function toggleEditPreviewPort() {
  if (previewPortInput.value.style.display === 'none') {
    previewPortInput.value.style.display = 'inline-block';
    previewPortInput.value.value = previewPortValue.value.textContent;
    previewPortInput.value.focus();
    previewPortValue.value.style.display = 'none';
  } else {
    previewPortValue.value.textContent = previewPortInput.value.value;
    previewPortValue.value.style.display = 'inline-block';
    previewPortInput.value.style.display = 'none';
  }
}

intervalId.value = setInterval(() => {
  const failedPageUrl = store.get('loadFailedPage');
  if (failedPageUrl && failedPageUrl.includes(iframe.value.src)) {
    iframeError();
    store.del('loadFailedPage');
  }
}, 2300);

function refreshIframe() {
  const src = iframe.value.src;
  iframe.value.src = src;
}

function changePreviewPort() {
  const port = previewPortValue.value.textContent;
  if (!port) {
    alert('端口号为空');
    return;
  }
  store.set('projectRunOnDevPort', port);
  iframe.value.src = 'http://localhost:' + port.trim();
}

function scrollToTop() {
  iframe.value.contentWindow.scrollTo({top: 0, behavior: 'smooth'});
}

function scrollToBottom() {
  iframe.value.contentWindow.scrollTo({top: iframe.value.contentDocument.body.scrollHeight, behavior: 'smooth'});
}

function onPreviewPortInputBlur() {
  toggleEditPreviewPort();
  changePreviewPort();
} </script>

<template>
  <div class="fixed w-full h-screen">
    <div class="flex w-auto toolbar bg-gray-800 text-white py-2 px-1 items-center justify-between shadow">
      <div class="inline">
        预览地址: http://localhost:
        <span
          id="previewPortValue"
          ref="previewPortValue"
          class="font-bold"
        >3000</span>
        <input
          id="previewPortInput"
          ref="previewPortInput"
          type="text"
          class="hidden text-gray-900"
          @blur="onPreviewPortInputBlur"
        >
        <button
          id="edit-button"
          ref="editButton"
          class="edit-button bg-red-500 rounded p-1"
          @click="toggleEditPreviewPort"
        >
          <i class="fa fa-pencil"></i>
        </button>
      </div>
      <button
        class="bg-gray-600 rounded px-2 w-auto"
        @click="refreshIframe"
      >
        刷新
      </button>
      <div>
        &gt;
      </div>
    </div>

    <div
      id="content"
      class=" bg-gray-200 relative w-full h-full"
    >
      <div
        id="iframe-container"
        class=""
      >
        <iframe
          id="iframePage"
          ref="iframe"
          src="http://localhost:3000"
          class="w-full h-full"
          style="width: 100%; height: 100%;"
          @load="iframeLoaded"
          @error="iframeError"
        ></iframe>
        <div
          id="loadingMessage"
          ref="loadingMessage"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white p-4 rounded"
        >
          Loading...
        </div>
        <div
          id="errorMessage"
          ref="errorMessage"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white p-4 rounded"
          style="display:none;"
        >
          Failed to load the content.
        </div>
      </div>

      <div class="scroll-button fixed bottom-10 right-5 flex flex-col items-center">
        <button
          class="button bg-green-500 text-white py-2 px-4 mt-2 rounded"
          onclick="scrollToTop()"
        >
          Scroll to Top
        </button>
        <button
          class="button bg-green-500 text-white py-2 px-4 mt-2 rounded"
          onclick="scrollToBottom()"
        >
          Scroll to Bottom
        </button>
      </div>
    </div>
  </div>
</template>
