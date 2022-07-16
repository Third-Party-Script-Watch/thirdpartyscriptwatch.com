<template>
    <div class="script" :id="'script_' + props.script?.id" :class="{ pinned: state.isPinned }" :style="{ '--index': metricIndex }">
        <h3><a :href="'#script_' + props.script?.id" v-html="getScriptName(props.script?.name)"></a></h3>
        <div class="metadata">
            <p><strong>Date:</strong> <span class="retrieved">{{ formatDate(metric.retrieved) }}</span></p>
            <p v-if="metric.contentLength === -1">
                <strong>Initial script: </strong>No data
            </p>
            <details v-else>
                <summary>
                    <strong>Initial script: </strong>
                    <span class="size">{{ formatSize(metric.contentLength) }} </span>
                    <span class="trend" :class="getTrendClass(metric.contentLength, getPreviousMetric(metric.retrieved).contentLength)"
                        :title="getTrendTitle(metric.contentLength, getPreviousMetric(metric.retrieved).contentLength)"></span>
                </summary>
                <strong>URL:</strong>
                <pre class="url">{{ props.script?.url }}</pre>
                <strong v-if="props.script?.initialisationHtml">Initialisation HTML:</strong>
                <pre v-if="props.script?.initialisationHtml"
                    class="initialisation-html">{{ formatCode(props.script?.initialisationHtml) }}</pre>
            </details>
            <p v-if="(metric.subresources === undefined || metric.subresources.length === 0)">
                <strong class="subresources-label">0 subresources</strong>
            </p>
            <details class="subresources"
                v-if="metric.contentLength >= 0 && metric.subresources !== undefined && metric.subresources.length > 0">
                <summary>
                    <strong class="subresources-label">{{ metric.subresources.length }} subresources: </strong>
                    <span class="subresources-size">{{ formatSize(getSubresourcesSize(metric.subresources)) }} </span>
                    <span class="subresources-trend"
                        :class="getTrendClass(getSubresourcesSize(metric.subresources), getSubresourcesSize(getPreviousMetric(metric.retrieved).subresources))"
                        :title="getTrendTitle(getSubresourcesSize(metric.subresources), getSubresourcesSize(getPreviousMetric(metric.retrieved).subresources))"></span>
                </summary>
                <table>
                    <thead>
                        <tr>
                            <th>Size</th>
                            <th><abbr title="Encoding">Enc.</abbr></th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody v-for="subresource in metric.subresources">
                        <tr>
                            <th colspan="3">
                                <pre class="url">{{ subresource.url }}</pre>
                            </th>
                        </tr>
                        <tr>
                            <td>{{ formatSize(subresource.contentLength) }}</td>
                            <td>{{ subresource.contentEncoding ? subresource.contentEncoding : '-' }}</td>
                            <td>{{
                                    subresource.contentType ? subresource.contentType.split(';')[0] : '-'
                            }}</td>
                        </tr>
                    </tbody>
                </table>
            </details>
        </div>
        <div class="chart-wrapper">
            <svg viewBox="0 0 300 104" class="chart" @click="onChartClick" @mousemove="onChartMousemove" @touchmove="onChartMousemove">
                <polyline class="chart-line" fill="none" stroke="#0074d9" stroke-width="1" :points="state.pointsCache.join('\n')" />
                <line :x1="metricIndex * 10" y1="1" :x2="metricIndex * 10" y2="104" stroke="#CCCCCC" class="chart-indicator-line" />
                <circle :cx="metricIndex * 10" :cy="state.pointsCache[metricIndex] ? state.pointsCache[metricIndex].split(', ')[1] : 0"
                    r="2" fill="#DB00FF" stroke="#e3e3e3" stroke-width="1" class="chart-indicator" />
            </svg>
            <p class="date-range">
                <span class="start-date">{{ formatDate(props.script?.metrics.at(0).retrieved) }}</span>
                <span class="end-date">{{ formatDate(props.script?.metrics.at(-1).retrieved) }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

const props = defineProps({
    script: Object
})

const state = reactive<{ isPinned: boolean, pointsCache: string[] }>({
    isPinned: false,
    pointsCache: []
});

const metric = ref(props.script?.metrics.at(-1))
const metricIndex = ref(29)

onMounted(() => {
    generatePoints(props.script?.metrics);
});

function getScriptName(name: string): string {
    return name.replace(
        /\(([^\)]*)\)/g,
        '<small>$1</small>'
    )
}

function getSubresourcesSize(subresources) {
    if (subresources === undefined) {
        return -1;
    }

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

function getPreviousMetric(retrieved: Date) {
    const previousMetricIndex =
        props.script?.metrics.findIndex((x) => x.retrieved === retrieved) -
        1;
    if (previousMetricIndex > -1) {
        return props.script?.metrics[previousMetricIndex];
    }
}

function getTrendClass(
    currentSize: number,
    previousSize: number
) {
    // Consider any change greater than this many bytes to be an upward or downward trend
    const changeThreshold = 1024;

    let className = '';

    if (previousSize === -1 || currentSize === -1) {
        className = '';
    } else if (currentSize - previousSize > changeThreshold) {
        className = 'up';
    } else if (previousSize - currentSize > changeThreshold) {
        className = 'down';
    } else {
        className = 'flat';
    }

    return className;
}


function getTrendTitle(
    currentSize: number,
    previousSize: number
) {
    let title = '';

    if (previousSize === -1 || currentSize === -1) {
    } else if (currentSize > previousSize) {
        title = `Increased ${currentSize - previousSize
            }b since previous day`;
    } else if (currentSize < previousSize) {
        title = `Decreased ${previousSize - currentSize
            }b since previous day`;
    } else if (currentSize === previousSize) {
        title = `No change since previous day`;
    }

    return title;
}

function onChartClick() {
    state.isPinned = !state.isPinned
}

function onChartMousemove(e) {

    if (!state.isPinned) {
        const br = e.target.getBoundingClientRect();
        const indexMultiplier = br.width / 30;
        const x = e.touches ? e.touches[0].clientX - br.left : e.offsetX;
        const index = Math.round(x / indexMultiplier);

        if (index < props.script?.metrics.length) {
            metric.value = props.script?.metrics.at(index);
            metricIndex.value = index;
        }
    }
}

</script>
