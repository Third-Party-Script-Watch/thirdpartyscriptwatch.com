import { KeyTrigger } from './key-trigger';

const $output = document.getElementById('output');

function getCacheBuster(): string {
  return '?' + new Date().toISOString().substring(0, 11);
}

if ($output !== null) {
  const dataUrl =
    'https://data.thirdpartyscriptwatch.com/data/metrics-30.json' +
    getCacheBuster();
  // For local testing against Azure Storage Emulator:
  // const dataUrl =
  //   'http://127.0.0.1:10000/devstoreaccount1/data/metrics-30.json';

  setTimeout(() => {
    document.body.classList.add('loading');
  }, 300);

  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      setTimeout(() => {
        document.body.classList.remove('loading');
      }, 300);
      $output.innerHTML = '';
      data.forEach((script) => {
        script.metrics = groupSubresources(script.metrics);
        if (script.metrics.length < 30) {
          script.metrics = fillEmpty(script.metrics);
        }
        const $el = createScript(script);
        $output.appendChild($el);
      });
      scrollToAnchorlink();
      attachFilterHandlers();

      const params = new URLSearchParams(document.location.search);
      if (params !== undefined) {
        const keywords = params.get('q');

        if (keywords !== null) {
          const $keywords = document.getElementById('q') as HTMLInputElement;
          $keywords.value = keywords;
          filterScripts(keywords);
        }
      }
    });

  function groupSubresources(metrics: any[]): any[] {
    return metrics
      .filter((x) => x.isInitialRequest)
      .map((metric) => {
        return {
          ...metric,
          subresources: metrics.filter(
            (x) => !x.isInitialRequest && x.retrieved === metric.retrieved
          ),
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
          retrieved: `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
          contentLength: -1,
        });
      }

      return data.reverse();
    }
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

  function getSubresourcesTable(subresources) {
    let html = `<table>
    <thead>
      <tr>
        <th>Size</th>
        <th><abbr title="Encoding">Enc.</abbr></th>
        <th>Type</th>
      </tr>
    </thead>
`;

    subresources.forEach((metric) => {
      html += `<tbody>
        <tr><th colspan="3"><pre class="url">${metric.url}</pre></th></tr>
        <tr>
          <td>${formatSize(metric.contentLength)}</td>
          <td>${metric.contentEncoding ? metric.contentEncoding : '-'}</td>
          <td>${
            metric.contentType ? metric.contentType.split(';')[0] : '-'
          }</td>
        </tr>
      </tbody>`;
    });

    html += '</table>';

    return html;
  }

  function populateMetadata($script, metric, scriptData) {
    const dt = new Date(metric.retrieved);
    const subresources = metric.subresources;

    if (metric.contentLength === -1) {
      setElementText($script, '.retrieved', formatDate(dt) + ' (UTC)');
      setElementText($script, '.size', '-');
      setElementTitle($script, '.size', '');
      setElementText($script, '.subresources-label', '0 subresources');
      setElementText($script, '.subresources-size', '');
      setElementTitle($script, '.subresources-size', '');
    } else {
      const html = `
        <p><strong>Date:</strong> <span class="retrieved"></span></p>
        <details>
          <summary><strong>Initial script:</strong> <span class="size"></span> <span class="trend"></span></summary>
          <strong>URL:</strong>
          <pre class="url"></pre>
          <strong>Initialisation HTML:</strong>
          <pre class="initialisation-html"></pre>
        </details>
        `;

      const contentLength = metric.contentLength;
      const subresourcesSize = subresources
        .map((x) => x.contentLength)
        .reduce((a, b) => a + b, 0);

      $script.querySelector('.metadata').innerHTML = html;

      const $url = $script.querySelector('.url');
      if ($url) {
        $url.innerText = scriptData.url;
      }

      const $initialisationHtml = $script.querySelector('.initialisation-html');
      if ($initialisationHtml && scriptData.initialisationHtml !== undefined) {
        $initialisationHtml.innerText = scriptData.initialisationHtml
          .replace(/\\n/g, `\n`)
          .replace(/\\"/g, `"`);
      }

      const $subresourcesWrapper = document.createElement('div');
      const subresourcesHtml =
        metric.subresources.length > 0
          ? `<details class="subresources">
          <summary><strong class="subresources-label"></strong> <span class="subresources-size"></span> <span class="subresources-trend"></span></summary>
        </details>`
          : `<p>
          <strong class="subresources-label"></strong> <span class="subresources-size"></span>
        </p>`;

      $subresourcesWrapper.innerHTML = subresourcesHtml;
      $script.querySelector('.metadata').appendChild($subresourcesWrapper);

      const $subresources = $script.querySelector('.subresources');
      if ($subresources && metric.subresources.length > 0) {
        const $subresourcesTable = document.createElement('div');
        $subresourcesTable.innerHTML = getSubresourcesTable(
          metric.subresources
        );
        $subresources.appendChild($subresourcesTable);
      }

      setElementText($script, '.retrieved', formatDate(dt) + ' (UTC)');
      setElementText($script, '.size', formatSize(contentLength));
      setElementTitle($script, '.size', `${contentLength} bytes`);

      const previousMetricIndex =
        scriptData.metrics.findIndex((x) => x.retrieved === metric.retrieved) -
        1;
      if (previousMetricIndex > -1) {
        const previousMetric = scriptData.metrics[previousMetricIndex];
        const previousSize = previousMetric.contentLength;
        setTrend($script, '.trend', contentLength, previousSize);
      }

      if (subresources.length > 0) {
        setElementText(
          $script,
          '.subresources-label',
          `${subresources.length} subresource${
            subresources.length > 1 ? 's' : ''
          }:`
        );
        setElementText(
          $script,
          '.subresources-size',
          formatSize(subresourcesSize)
        );
        setElementTitle(
          $script,
          '.subresources-size',
          `${subresourcesSize} bytes`
        );

        if (previousMetricIndex > -1) {
          const previousMetric = scriptData.metrics[previousMetricIndex];
          if (previousMetric.contentLength > -1) {
            const previousSize = previousMetric.subresources
              .map((x) => x.contentLength)
              .reduce((a, b) => a + b, 0);
            setTrend(
              $script,
              '.subresources-trend',
              subresourcesSize,
              previousSize
            );
          } else {
            setTrend($script, '.subresources-trend', 0, 0);
          }
        }
      } else {
        setElementText($script, '.subresources-label', '0 subresources');
      }
    }
  }

  function createScript(data) {
    const html = `<h3></h3>
    <div class="metadata"></div>
    <div class="chart-wrapper">
      <svg viewBox="0 0 300 104" class="chart">
        <polyline
          class="chart-line"
          fill="none"
          stroke="#0074d9"
          stroke-width="1"
          points=""
        />
        <line x1="-16" y1="1" x2="-16" y2="104" stroke="#CCCCCC" class="chart-indicator-line"/>
        <circle cx="-16" cy="-16" r="2" fill="#DB00FF" stroke="#e3e3e3" stroke-width="1" class="chart-indicator" />
      </svg>
      <p class="date-range">
        <span class="start-date"></span>
        <span class="end-date"></span>
      </p>
    </div>`;

    const $script = document.createElement('div');
    $script.className = 'script';
    $script.id = 'script_' + data.id;
    $script.innerHTML = html;

    if ($script !== null) {
      const $innerEl = $script.querySelector<HTMLElement>('h3');
      if ($innerEl !== null) {
        $innerEl.innerHTML = `<a href="#${$script.id}">${data.name.replace(
          /\(([^\)]*)\)/g,
          '<small>$1</small>'
        )}</a>`;
      }
    }

    setElementText(
      $script,
      '.start-date',
      formatDate(new Date(data.metrics[0].retrieved))
    );
    setElementText(
      $script,
      '.end-date',
      formatDate(new Date(data.metrics[data.metrics.length - 1].retrieved))
    );

    populateMetadata($script, data.metrics[data.metrics.length - 1], data);

    const $chartLine = $script.querySelector('.chart-line');
    const points = generatePoints(data.metrics);
    if ($chartLine !== null) {
      $chartLine.setAttribute('points', points.join('\n'));
    }

    const $chart = $script.querySelector<SVGElement>('.chart');
    if ($chart !== null) {
      $chart.setAttribute(
        'title',
        `Chart showing the size of the ${
          data.name
        } script over the period ${formatDate(
          new Date(data.metrics[0].retrieved)
        )} to ${formatDate(
          new Date(data.metrics[data.metrics.length - 1].retrieved)
        )}`
      );
      attachHandlers($script, $chart, data.metrics, points, data);
    }

    return $script;
  }

  function attachHandlers(
    $script: HTMLElement,
    $chart: SVGElement,
    metrics,
    points,
    scriptData
  ) {
    const $chartIndicator =
      $chart.querySelector<HTMLElement>('.chart-indicator');
    const $chartIndicatorLine = $chart.querySelector<HTMLElement>(
      '.chart-indicator-line'
    );

    if ($chartIndicator !== null && $chartIndicatorLine !== null) {
      const index = 29;
      $chartIndicator.setAttribute('cx', (index * 10).toString());
      $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
      $chartIndicatorLine.setAttribute('x1', (index * 10).toString());
      $chartIndicatorLine.setAttribute('x2', (index * 10).toString());

      let isPinned = false;
      $chart.addEventListener(
        'click',
        (x) => {
          isPinned = !isPinned;
          $script.classList.toggle('pinned');
        },
        { passive: true }
      );

      $chart.addEventListener(
        'mousemove',
        (x) => {
          if (!isPinned) {
            const br = $chart.getBoundingClientRect();
            const indexMultiplier = br.width / 30;

            const index = Math.round(x.offsetX / indexMultiplier);
            if (metrics[index]) {
              $script.style.setProperty('--index', index.toString());
              populateMetadata($script, metrics[index], scriptData);
              $chartIndicator.setAttribute('cx', (index * 10).toString());
              $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
              $chartIndicatorLine.setAttribute('x1', (index * 10).toString());
              $chartIndicatorLine.setAttribute('x2', (index * 10).toString());
            }
          }
        },
        { passive: true }
      );
      $chart.addEventListener(
        'touchmove',
        (e) => {
          if (!isPinned) {
            const br = $chart.getBoundingClientRect();
            const x = e.touches[0].clientX - br.left;
            const index = Math.round(x / 10);
            if (metrics[index]) {
              $script.style.setProperty('--index', index.toString());
              populateMetadata($script, metrics[index], scriptData);
              $chartIndicator.setAttribute('cx', (index * 10).toString());
              $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
              $chartIndicatorLine.setAttribute('x1', (index * 10).toString());
              $chartIndicatorLine.setAttribute('x2', (index * 10).toString());
            }
          }
        },
        { passive: true }
      );
    }
  }

  function setElementText(
    $el: HTMLElement | null,
    selector: string,
    text: string
  ) {
    if ($el !== null) {
      const $innerEl = $el.querySelector<HTMLElement>(selector);
      if ($innerEl !== null) {
        $innerEl.innerText = text;
      }
    }
  }

  function setElementTitle(
    $el: HTMLElement | null,
    selector: string,
    text: string
  ) {
    if ($el !== null) {
      const $innerEl = $el.querySelector<HTMLElement>(selector);
      if ($innerEl !== null) {
        $innerEl.title = text;
      }
    }
  }
}

function setTrend(
  $el: HTMLElement | null,
  selector: string,
  currentSize: number,
  previousSize: number
) {
  if ($el !== null) {
    // Consider any change greater than this many bytes to be an upward or downward trend
    const changeThreshold = 1024;

    const $innerEl = $el.querySelector<HTMLElement>(selector);
    if ($innerEl !== null) {
      if (previousSize === -1 || currentSize === -1) {
        $innerEl.title = '';
        $innerEl.className = `${selector.replace('.', '')}`;
      } else if (currentSize - previousSize > changeThreshold) {
        $innerEl.className = `${selector.replace('.', '')} up`;
      } else if (previousSize - currentSize > changeThreshold) {
        $innerEl.className = `${selector.replace('.', '')} down`;
      } else {
        $innerEl.className = `${selector.replace('.', '')} flat`;
      }

      if (currentSize > previousSize) {
        $innerEl.title = `Increased ${
          currentSize - previousSize
        }b since previous day`;
      } else if (currentSize < previousSize) {
        $innerEl.title = `Decreased ${
          previousSize - currentSize
        }b since previous day`;
      } else if (currentSize === previousSize) {
        $innerEl.title = `No change since previous day`;
      }
    }
  }
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

function attachFilterHandlers() {
  const $keywords = document.getElementById('q') as HTMLInputElement;

  $keywords?.addEventListener(
    'input',
    (e) => {
      const keywords = $keywords.value.trim().toLowerCase();
      filterScripts(keywords);
      window.history.replaceState(
        {},
        document.title,
        keywords === '' ? window.location.pathname : `?q=${keywords}`
      );
    },
    { passive: true }
  );

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(document.location.search);
    if (params !== undefined) {
      const keywords = params.get('q');

      if (keywords !== null) {
        const $keywords = document.getElementById('q') as HTMLInputElement;
        $keywords.value = keywords;
        filterScripts(keywords);
      }
    }
  });
}

function filterScripts(keywords: string) {
  const $scripts = document.querySelectorAll('.script');
  $scripts.forEach(($script) => {
    if (keywords === '') {
      $script.classList.remove('hidden');
    } else {
      const normalisedName = $script
        .querySelector('h3')
        ?.innerText.toLowerCase();
      const hasMatchingUrl = Array.from($script.querySelectorAll('.url')).find(
        (x) => x.innerHTML.toLowerCase().includes(keywords)
      );
      $script.classList.toggle(
        'hidden',
        !(
          (normalisedName && normalisedName.includes(keywords)) ||
          hasMatchingUrl
        )
      );
    }
  });
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

  const $nextUpdate = document.querySelector('.next-update') as HTMLElement;
  if ($nextUpdate !== null) {
    $nextUpdate.innerText = getRemaining(now, nextUpdate);
    $nextUpdate.setAttribute(
      'title',
      `${nextUpdate.toLocaleString()} local time (midnight UTC)`
    );
  }
}
let nextUpdateTimer = setInterval(() => {
  setNextUpdate();
}, 60000);
setNextUpdate();

let headerClickCount = 0;
let headerClickCounter;

function onHeaderClick() {
  headerClickCount++;
  if (headerClickCounter !== undefined) {
    window.clearTimeout(headerClickCounter);
  }
  headerClickCounter = window.setTimeout(() => {
    headerClickCount = 0;
  }, 300);

  if (headerClickCount === 5) {
    document.body.classList.toggle('inception');
  }
}

document
  .querySelector('header')
  ?.addEventListener('click', onHeaderClick, { passive: true });

let introClickCount = 0;
let introClickCounter;

function onIntroClick() {
  introClickCount++;
  if (introClickCounter !== undefined) {
    window.clearTimeout(introClickCounter);
  }
  introClickCounter = window.setTimeout(() => {
    introClickCount = 0;
  }, 300);

  if (introClickCount === 3) {
    document.body.classList.toggle('party');
  }
}

document
  .querySelector('.intro')
  ?.addEventListener('click', onIntroClick, { passive: true });

(async () => {
  KeyTrigger.delay = 5000;
  KeyTrigger.listenFor('528491').then(() => {
    document.body.classList.toggle('inception');
  });
  KeyTrigger.listenFor('party').then(() => {
    document.body.classList.toggle('party');
  });
})();
