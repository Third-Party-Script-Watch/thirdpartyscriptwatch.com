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

<style lang="scss" scoped>
@use '../style/design-tokens';

form {
    width: 300px;
    padding: 0 16px;
    margin-bottom: 16px;

    @media (min-width: 1024px) {
        display: flex;
        justify-content: space-between;
        column-gap: 16px;
        align-items: center;
        width: 650px;
        margin-bottom: 0;
    }
}

.results-heading {
    font-size: 24px;
    font-weight: 100;
}

.next-update {
    margin-bottom: 24px;
    flex-grow: 1;
    font-size: 14px;

    @media (min-width: 1024px) {
        margin-bottom: 6px;
    }
}

.filter {
    position: relative;

    label {
        position: absolute;
        top: -16px;
        left: 0;
        font-size: 12px;
        font-weight: 300;
        transition: all 0.15s ease-in-out;
    }

    input {
        width: 100%;
        padding: 4px 4px 4px 32px;
        background-color: rgba(design-tokens.$colours-grey-300, 0.5);
        border: 1px solid design-tokens.$colours-grey-300;
        border-radius: 4px;

        @media (min-width: 1024px) {
            width: 14rem;
        }

        &:focus-visible {
            outline: none;
            border-color: design-tokens.$colours-grey-700;
            box-shadow: 0 0 4px 4px rgba(design-tokens.$colours-primary, 0.3);
        }

        &:placeholder-shown+label {
            top: 4px;
            left: 32px;
            font-size: 14px;
        }

        &:focus-visible+label {
            top: -16px;
            left: 0;
            font-size: 12px;
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: 1px;
        left: 4px;
        display: block;
        width: 24px;
        height: 24px;
        background: url(data-url:/node_modules/@material-design-icons/svg/round/search.svg);
        opacity: 0.2;
    }
}
</style>