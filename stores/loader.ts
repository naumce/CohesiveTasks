import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useLoaderStore = defineStore('loader', () => {
	const loading = ref<boolean>(false);

	function showLoader(value: boolean) {
		loading.value = value;
	}

	return { loading, showLoader };
});
