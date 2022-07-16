<template>
  <Filter @filter-change="onFilterChange"></Filter>
  <img src="../images/loading.svg" class="loading-spinner" width="32" alt="Loading..." v-if="state.scripts.length === 0" />
  <Script v-else v-for="script in filteredScripts" :key="script.id" :script="script"></Script>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watchEffect } from 'vue';

import Filter from './Filter.vue'
import Script from './Script.vue'

const state = reactive<{ scripts: any[] }>({
  scripts: []
});

const filteredScripts = computed(filterScripts);

const filterKeywords = ref('');

setTimeout(() => {
  document.body.classList.add('loading');
}, 300);


watchEffect(async () => {
  const url = 'https://data.thirdpartyscriptwatch.com/data/metrics-30.json' + getCacheBuster();
  // For local testing against Azure Storage Emulator:
  // const url = 'http://127.0.0.1:10000/devstoreaccount1/data/metrics-30.json';

  state.scripts = await (await fetch(url)).json().then((data) => {

    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 300);

    data.forEach((script) => {
      script.metrics = groupSubresources(script.metrics);
      if (script.metrics.length < 30) {
        script.metrics = fillEmpty(script.metrics);
      }
    });

    scrollToAnchorlink();

    return data;
  });
})

function getCacheBuster(): string {
  return '?' + new Date().toISOString().substring(0, 10);
}

function groupSubresources(metrics: any[]): any[] {
  return metrics
    .filter((x) => x.isInitialRequest)
    .map((metric) => {
      return {
        ...metric,
        subresources: metrics.filter(
          (x) => !x.isInitialRequest && x.retrieved === metric.retrieved
        ),
        retrieved: new Date(metric.retrieved),
      };
    });
}

function fillEmpty(data) {
  if (data.length > 0) {
    const startDate = new Date(data[data.length - 1].retrieved);
    data = data.reverse();
    while (data.length < 30) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - data.length);
      data.push({
        retrieved: new Date(`${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`),
        contentLength: -1,
      });
    }

    return data.reverse();
  }
}

function onFilterChange(keywords: string) {
  filterKeywords.value = keywords;
}

function filterScripts() {
  if (filterKeywords.value === '') {
    return state.scripts;
  }

  return state.scripts.filter(script => {
    const hasMatchingUrl = script.url.toLowerCase().includes(filterKeywords.value);
    return script.name.toLowerCase().includes(filterKeywords.value) || hasMatchingUrl
  });
}

function scrollToAnchorlink() {
  if (window.location.hash && window.location.hash.startsWith('#script_')) {
    setTimeout(() => {
      const $script = document.querySelector(window.location.hash);
      if ($script !== null) {
        $script.classList.add('target');
        $script.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 100);
  }
}
</script>
