import store from './store/store';

export async function restartApplication() {
  await store.persistor.purge();
  window.location.reload();
}