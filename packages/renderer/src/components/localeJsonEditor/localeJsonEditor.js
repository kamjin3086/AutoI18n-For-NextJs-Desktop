import {store} from '#preload';

class ModifiedJsonMetadata {
  constructor(jsonFilePath, modifiedJsonData, originalJsonData, modifiedMetadataList) {
    this.jsonFilePath = jsonFilePath;
    this.modifiedJsonData = modifiedJsonData;
    this.originalJsonData = originalJsonData;
    this.modifiedMetadataList = modifiedMetadataList;
  }
}

class ModifiedJsonMetadataItem {
  constructor(parentJsonKey, originalJsonKey, modifiedJsonKey, modifiedJsonValue, checked, dataPath) {
    this.parentJsonKey = parentJsonKey;
    this.originalJsonKey = originalJsonKey;
    this.modifiedJsonKey = modifiedJsonKey;
    this.modifiedJsonValue = modifiedJsonValue;
    this.checked = checked;
    this.dataPath = dataPath;
  }
}

function getOriginalLocaleJsonData() {
  try {
    return JSON.parse(store.get('localeJsonData'));
  } catch (e) {
    return null;
  }
}

const historyStack = [];
const redoStack = [];

function recordHistory(cell, change, type) {
  historyStack.push({cell, change, type});
  redoStack.length = 0;
}

function onKeyChange(oldKey, newKey, cell) {
  console.log(`Key changed from "${oldKey}" to "${newKey}"`);
  recordHistory(cell, {old: oldKey, new: newKey}, 'key');
}

function onValueChange(oldValue, newValue, currentKey, cell) {
  console.log(`Value changed from "${oldValue}" to "${newValue}"`);
  recordHistory(cell, {old: oldValue, new: newValue}, 'value');
}

function undo() {
  if (historyStack.length > 0) {
    const lastChange = historyStack.pop();
    redoStack.push(lastChange);
    applyChange(lastChange, 'undo');
  }
  console.log('Undo ok');
}

function redo() {
  if (redoStack.length > 0) {
    const lastChange = redoStack.pop();
    historyStack.push(lastChange);
    applyChange(lastChange, 'redo');
  }
  console.log('Redo ok');
}

function applyChange(change, type) {
  const {cell, change: changeData} = change;
  cell.textContent = changeData[type === 'undo' ? 'old' : 'new'];
}

function resetData() {
  console.log('Reset button clicked.');
  historyStack.length = 0;
  redoStack.length = 0;

  setTimeout(() => {
    const jsonTable = document.getElementById('jsonTable').querySelector('tbody');
    jsonTable.innerHTML = '';
    const data = getOriginalLocaleJsonData();
    if (!data) {
      console.log('No original data found.');
      return;
    }
    populateTable(jsonTable, data, []);
    console.log('Reset completed.');
  }, 0);

  try {
    store.delete('localeJsonEditResult');
  } catch (e) {
    //ignore
  }
}

function createCheckbox(parentCheckbox, checked, rowLevel) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = `${rowLevel} w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-200 focus:outline-none`;
  if (checked) {
    checkbox.checked = true;
  }

  if (parentCheckbox) {
    parentCheckbox.childCheckboxes = parentCheckbox.childCheckboxes || [];
    parentCheckbox.childCheckboxes.push(checkbox);
  }

  checkbox.addEventListener('change', function() {
    if (checkbox.childCheckboxes) {
      checkbox.childCheckboxes.forEach(childCheckbox => {
        childCheckbox.checked = checkbox.checked;
      });
    }
  });
  return checkbox;
}

function beginEditValue(cell, input) {
  if (cell.classList.contains('active')) {
    return;
  }
  cell.classList.add('active');

  input.value = cell.textContent;
  cell.appendChild(input);
  input.focus();
}

const blankRegex = /^\s*$/;

function populateTable(parentElement, data, checkedByDataPathMap, level = 0, parentCheckbox = null, parentPath = '') {
  const fragment = document.createDocumentFragment();
  for (const key in data) {
    const row = document.createElement('tr');

    const currentPath = parentPath ? `${parentPath}/${key}` : key;
    row.setAttribute('data-path', currentPath);
    row.setAttribute('original-key', key);
    row.setAttribute('original-value', data[key]);

    if (level === 0) {
      row.setAttribute('data-root', 'true');
    } else {
      row.setAttribute('data-parent', parentPath);
    }
    row.setAttribute('data-level', level.toString());

    const checkboxCell = document.createElement('td');
    const checkbox = createCheckbox(parentCheckbox, checkedByDataPathMap[currentPath], `level-${level}`);
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    const keyCell = document.createElement('td');
    if (level === 0) {
      keyCell.className = `level-${level} text-bold pt-5 pb-2 text-gray-800 dark:text-gray-200`;
    } else {
      keyCell.className = `level-${level} pl-5 text-sm text-gray-700 dark:text-gray-300`;
    }
    keyCell.textContent = key;

    const keyInput = document.createElement('textarea');
    keyInput.style.whiteSpace = 'pre-wrap';
    keyInput.className = 'pl-5 text-sm w-full h-full text-gray-800 bg-gray-300';

    if (level > 0) {
      keyCell.addEventListener('click', function() {
        beginEditValue(keyCell, keyInput);
      });
    }

    keyInput.addEventListener('blur', function() {
      keyCell.classList.remove('active');
      onKeyChange(keyCell.textContent, keyInput.value, keyCell);
      if (blankRegex.test(keyInput.value)) {
        alert('key不能为空');
        keyInput.value = keyCell.textContent;
      }
      if (keyCell.contains(keyInput)) {
        keyCell.textContent = keyInput.value;
      }
    });

    row.appendChild(keyCell);

    if (typeof data[key] === 'object') {
      const emptyValueCell = document.createElement('td');
      emptyValueCell.textContent = '';
      row.appendChild(emptyValueCell);
      fragment.appendChild(row);

      populateTable(fragment, data[key], checkedByDataPathMap, level + 1, checkbox, currentPath);
    } else {
      const valueCell = document.createElement('td');
      valueCell.textContent = data[key];
      valueCell.className = 'text-sm pl-5  text-gray-700 dark:text-gray-300';

      const valueInput = document.createElement('textarea');
      valueInput.style.whiteSpace = 'pre-wrap';
      valueInput.className = 'text-sm pl-5 w-full h-full text-gray-800 bg-gray-300';

      valueCell.addEventListener('click', function() {
        beginEditValue(valueCell, valueInput);
      });

      valueInput.addEventListener('blur', function() {
        valueCell.classList.remove('active');
        onValueChange(valueCell.textContent, valueInput.value, keyCell.textContent, valueCell);
        if (valueCell.contains(valueInput)) {
          valueCell.textContent = valueInput.value;
        }
      });

      row.appendChild(valueCell);
      fragment.appendChild(row);
    }

    // if (level === 0) {
    //   const toggleButton = document.createElement('button');
    //   toggleButton.textContent = '+';
    //   toggleButton.className = 'toggle-button text-white bg-blue-500 rounded px-2 py-1 ml-2';
    //   toggleButton.addEventListener('click', () => {
    //     const isExpanded = toggleButton.textContent === '-';
    //     toggleButton.textContent = isExpanded ? '+' : '-';
    //     const childRows = parentElement.querySelectorAll(`[data-parent="${currentPath}"]`);
    //     childRows.forEach(childRow => {
    //       childRow.style.display = isExpanded ? 'none' : '';
    //     });
    //   });
    //   keyCell.appendChild(toggleButton);
    // }
  }
  parentElement.appendChild(fragment);
}

function obtainModifiedJsonMetadata() {
  const jsonTable = document.getElementById('jsonTable').querySelector('tbody');
  const modifiedJsonMetadataItemList = [];
  const modifiedData = constructModifiedJson(jsonTable, modifiedJsonMetadataItemList);
  const originalJsonData = getOriginalLocaleJsonData();
  return new ModifiedJsonMetadata(null, modifiedData, originalJsonData, modifiedJsonMetadataItemList);
}

function constructModifiedJson(rootElement, modifiedJsonMetadataItemList) {
  const modifiedJsonMetadata = {};
  const rootRows = rootElement.querySelectorAll('[data-root="true"]');
  rootRows.forEach(rootRow => {
    const key = rootRow.children[1].textContent;
    const childJson = constructChildJson(rootRow, modifiedJsonMetadataItemList);
    modifiedJsonMetadata[key] = childJson;
  });

  return modifiedJsonMetadata;
}

function constructChildJson(parentRow, modifiedJsonMetadataItemList) {
  const childJson = {};
  const childRows = parentRow.parentElement.querySelectorAll(`[data-parent="${parentRow.dataset.path}"]`);
  childRows.forEach(childRow => {
    const key = childRow.children[1].textContent;
    const hasChildren = childRow.querySelector('[data-parent]');
    const value = hasChildren ? constructChildJson(childRow, modifiedJsonMetadataItemList) : childRow.children[2].textContent;
    childJson[key] = value;

    const checkbox = childRow.children[0].children[0];
    const originalKey = childRow.getAttribute('original-key');
    const originalValue = childRow.getAttribute('original-value');
    const dataPath = childRow.getAttribute('data-path');

    if (key !== originalKey || value !== originalValue || checkbox.checked) {
      const parentJsonKey = childRow.getAttribute('data-parent');
      modifiedJsonMetadataItemList.push(new ModifiedJsonMetadataItem(
        parentJsonKey,
        originalKey,
        key,
        value,
        checkbox.checked,
        dataPath,
      ));
    }
  });

  return childJson;
}

function closeWindow() {
  //关闭页面
  //ipcRenderer.send('close-window-locale-json-editor', true);
}

export function sendLocaleJsonEditResult() {
  const modifyJsonMetadata = obtainModifiedJsonMetadata();
  console.log('saveData:' + JSON.stringify(modifyJsonMetadata, null, 4));
  store.set('localeJsonEditResult.modifyJsonMetadata', modifyJsonMetadata);
  alert('已确认编辑，在首页提交进行处理。');
}

function loadinit() {
  document.getElementById('undoButton').addEventListener('click', undo);
  document.getElementById('redoButton').addEventListener('click', redo);
  document.getElementById('resetButton').addEventListener('click', resetData);
}

export function onLoadedLoadData() {
  loadinit();
  const selectedProjectPath = store.get('selectedProjectPath');
  if (!selectedProjectPath) {
    alert('请先选择项目目录。');
    closeWindow();
    return;
  }

  const localeJsonData = getOriginalLocaleJsonData();
  if (!localeJsonData) {
    alert('没有读取到多语言JSON文件，请先选择 “全部翻译” 选项，配置好其他内容后提交，在初次运行后将得到多语言json文件，才可以使用当前编辑功能。');
    closeWindow();
    return;
  }

  console.log('Loaded default locale json data.');

  const jsonData = localeJsonData;
  const jsonTable = document.getElementById('jsonTable').querySelector('tbody');
  const data = store.get('localeJsonEditResult.modifyJsonMetadata.modifiedJsonData') || jsonData;
  const modifiedMetadataList = store.get('localeJsonEditResult.modifyJsonMetadata.modifiedMetadataList') || [];
  const checkedByDataPathMap = modifiedMetadataList.reduce((result, item) => {
    result[item.dataPath] = item.checked;
    return result;
  }, {});
  populateTable(jsonTable, data, checkedByDataPathMap);
}
