<template>
    <form>
        <h2 class="results-heading">Last 30 days results</h2>
        <p class="next-update"></p>
        <div class="filter">
            <input name="q" id="q" type="search" placeholder=" " v-model="keywords" @input="onKeywordsChange" />
            <label for="q">Filter by name or URL</label>
        </div>
    </form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits(['filterChange'])

const keywords = ref()

onMounted(() => {
    const params = new URLSearchParams(document.location.search);
    if (params !== undefined) {
        const keywordsParam = params.get('q');
        if (keywordsParam !== null) {
            keywords.value = keywordsParam;
            emit('filterChange', keywordsParam);
        }
    }
})

function onKeywordsChange() {
    emit('filterChange', keywords.value);
    window.history.replaceState(
        {},
        document.title,
        keywords.value === '' ? window.location.pathname : `?q=${keywords.value}`
    );
}
</script>