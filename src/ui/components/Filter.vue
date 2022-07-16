<template>
    <form>
        <h2 class="results-heading">Last 30 days results</h2>
        <p class="next-update" :title="nextUpdateTitle">{{ nextUpdateText }}</p>
        <div class="filter">
            <input name="q" id="q" type="search" placeholder=" " v-model="keywords" @input="onKeywordsChange" />
            <label for="q">Filter by name or URL</label>
        </div>
    </form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits(['filterChange'])

const keywords = ref();

const nextUpdateText = ref();
const nextUpdateTitle = ref();

let nextUpdateTimer;

onMounted(() => {
    const params = new URLSearchParams(document.location.search);
    if (params !== undefined) {
        const keywordsParam = params.get('q');
        if (keywordsParam !== null) {
            keywords.value = keywordsParam;
            emit('filterChange', keywordsParam);
        }
    }


    nextUpdateTimer = setInterval(() => {
        setNextUpdate();
    }, 60000);
    setNextUpdate();
})

function onKeywordsChange() {
    emit('filterChange', keywords.value);
    window.history.replaceState(
        {},
        document.title,
        keywords.value === '' ? window.location.pathname : `?q=${keywords.value}`
    );
}


function setNextUpdate() {
    const now = new Date();
    let nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 1);
    nextUpdate = new Date(
        Date.UTC(
            nextUpdate.getUTCFullYear(),
            nextUpdate.getUTCMonth(),
            nextUpdate.getUTCDate()
        )
    );

    nextUpdateText.value = getRemaining(now, nextUpdate);
    nextUpdateTitle.value = `${nextUpdate.toLocaleString()} local time (midnight UTC)`
}

function getRemaining(now: Date, then: Date): string {
    const seconds = Math.round((then.getTime() - now.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    let remaining = 'Data will update in ';

    if (minutes > 60) {
        remaining += `${Math.round(minutes / 60 - 1)}h `;
    }
    if (seconds > 60) {
        remaining += `${Math.round(minutes % 60)}m`;
    }
    if (seconds <= 60) {
        remaining += `${seconds}s`;
        nextUpdateTimer = setInterval(() => {
            setNextUpdate();
        }, 1000);
    }
    if (seconds <= 0) {
        remaining = 'Data updated - reload to view';
        clearInterval(nextUpdateTimer);
    }

    return remaining;
}

</script>