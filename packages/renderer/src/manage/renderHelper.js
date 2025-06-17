import {setLoading} from '/@/manage/sharedState.js';

export function showLoader() {
  setLoading(true);
}

export function hideLoader() {
  setLoading(false);
}

export function disableButton(elementId) {
  const element = document.getElementById(elementId);
  element.setAttribute('disabled', '');
}

export function enableButton(elementId) {
  const element = document.getElementById(elementId);
  element.removeAttribute('disabled');
}

export function showSuccess(text) {
  let elem = document.getElementById('resultLog');
  elem.classList.add('success');
  elem.classList.remove('error');
  elem.classList.remove('warning');
  elem.innerHTML = text;
}


function nowDateTime() {
  const date = new Date();
  return date.toLocaleString();
}

export function showError(text) {
  let elem = document.getElementById('resultLog');
  elem.classList.add('error');
  elem.classList.remove('success');
  elem.classList.remove('warning');
  elem.innerHTML = text;
}

export function showWarning(text) {
  let elem = document.getElementById('resultLog');
  elem.classList.add('warning');
  elem.classList.remove('success');
  elem.classList.remove('error');
  elem.innerHTML = text;
}
