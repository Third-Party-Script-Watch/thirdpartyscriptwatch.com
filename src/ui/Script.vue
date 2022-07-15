<template>
    <div class="script" :id="'script_' + props.script?.id" :class="{ pinned: state.isPinned }">
        <h3><a :href="'#script_' + props.script?.id" v-html="getScriptName(props.script?.name)"></a></h3>
        <div class="metadata">
            <p><strong>Date:</strong> <span class="retrieved">{{ formatDate(state.metric.retrieved) }}</span></p>
            <p v-if="state.metric.contentLength === -1">
                <strong>Initial script: </strong>
                No data
            </p>
            <details v-else>
                <summary>
                    <strong>Initial script: </strong>
                    <span class="size"> {{ formatSize(state.metric.contentLength) }}</span>
                    <span class="trend"></span>
                </summary>
                <strong>URL:</strong>
                <pre class="url">{{ props.script?.url }}</pre>
                <strong v-if="props.script?.initialisationHtml">Initialisation HTML:</strong>
                <pre v-if="props.script?.initialisationHtml"
                    class="initialisation-html">{{ formatCode(props.script?.initialisationHtml) }}</pre>
            </details>
            <p
                v-if="state.metric.contentLength >= 0 && (state.metric.subresources === undefined || state.metric.subresources.length === 0)">
                <strong class="subresources-label">0 subresources</strong>
            </p>
            <details class="subresources"
                v-if="state.metric.contentLength >= 0 && state.metric.subresources !== undefined && state.metric.subresources.length > 0">
                <summary>
                    <strong class="subresources-label">{{ state.metric.subresources.length }} subresources: </strong>
                    <span class="subresources-size">{{ formatSize(getSubresourcesSize(state.metric.subresources)) }}</span>
                    <span class="subresources-trend"></span>
                </summary>
                <p v-for="sr in state.metric.subresources">
                    {{ sr.url }}<br>
                    {{ sr.encoding }} - {{ formatSize(sr.contentLength) }}</p>
            </details>
        </div>
        <div class="chart-wrapper">
            <svg viewBox="0 0 300 104" class="chart" :style="{ '--index': state.metricIndex }" @click="onChartClick"
                @mousemove="onChartMousemove">
                <polyline class="chart-line" fill="none" stroke="#0074d9" stroke-width="1"
                    :points="generatePoints(props.script?.metrics).join('\n')" />
                <line :x1="state.metricIndex * 10" y1="1" :x2="state.metricIndex * 10" y2="104" stroke="#CCCCCC"
                    class="chart-indicator-line" />
                <circle :cx="state.metricIndex * 10"
                    :cy="state.pointsCache[state.metricIndex] ? state.pointsCache[state.metricIndex].split(', ')[1] : 0" r="2"
                    fill="#DB00FF" stroke="#e3e3e3" stroke-width="1" class="chart-indicator" />
            </svg>
            <p class="date-range">
                <span class="start-date">{{ formatDate(props.script?.metrics.at(0).retrieved) }}</span>
                <span class="end-date">{{ formatDate(props.script?.metrics.at(-1).retrieved) }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps({
    script: Object
})

const state = reactive<{ isPinned: boolean, metric: any, metricIndex: number, pointsCache: string[] }>({
    isPinned: false,
    metric: props.script?.metrics.at(-1),
    metricIndex: 29,
    pointsCache: []
});

function getScriptName(name: string): string {
    return name.replace(
        /\(([^\)]*)\)/g,
        '<small>$1</small>'
    )
}

function getSubresourcesSize(subresources) {
    return subresources
        .map((x) => x.contentLength)
        .reduce((a, b) => a + b, 0);
}

function generatePoints(data) {
    const pointsArray: string[] = [];
    const range = getRange(data);
    data.forEach((x, i) => {
        let contentLength = x.contentLength;
        if (x.subresources && x.subresources.length > 0) {
            contentLength += x.subresources
                .map((x) => x.contentLength)
                .reduce((a, b) => a + b);
        }
        pointsArray.push(
            `${i * 10}, ${102 - getPointHeight(contentLength, range)}`
        );
    });

    state.pointsCache = pointsArray;

    return pointsArray;
}

function getRange(data) {
    let min = data[0].contentLength;
    let max = data[0].contentLength;

    data.forEach((x) => {
        let contentLength = x.contentLength;
        if (x.subresources && x.subresources.length > 0) {
            contentLength += x.subresources
                .map((x) => x.contentLength)
                .reduce((a, b) => a + b);
        }

        if (contentLength < min) {
            min = contentLength;
        }
        if (contentLength > max) {
            max = contentLength;
        }
    });

    return [min, max];
}

function getPointHeight(size, range) {
    const diff = range[1] - range[0];
    return ((size - range[0]) / diff) * 100;
}

function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatSize(bytes) {
    return `${Math.round(bytes / 1024)} KiB`;
}

function formatCode(code: string) {
    return code
        .replace(/\\n/g, `\n`)
        .replace(/\\"/g, `"`);
}

function onChartClick() {
    state.isPinned = !state.isPinned
}

function onChartMousemove(e) {

    if (!state.isPinned) {
        const br = e.target.getBoundingClientRect();
        const indexMultiplier = br.width / 30;
        const index = Math.round(e.offsetX / indexMultiplier);

        if (index < props.script?.metrics.length) {
            state.metric = props.script?.metrics.at(index);
            state.metricIndex = index;
        }
    }
}

</script>
