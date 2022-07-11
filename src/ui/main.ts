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
    <tbody>
`;

    subresources.forEach((metric) => {
      html += `<tr><th colspan="3"><pre class="url">${
        metric.url
      }</pre></th></tr>
  <tr>
    <td>${formatSize(metric.contentLength)}</td>
    <td>${metric.contentEncoding ? metric.contentEncoding : '-'}</td>
    <td>${metric.contentType ? metric.contentType.split(';')[0] : '-'}</td>
  </tr>`;
    });

    html += '</tbody></table>';

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
          <summary><strong>Initial script:</strong> <span class="size"></span></summary>
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
          <summary><strong class="subresources-label"></strong> <span class="subresources-size"></span></summary>
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
        <circle cx="-16" cy="-16" r="2" fill="#DB00FF" class="chart-indicator" />
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
        $innerEl.innerHTML = `<a href="#${
          $script.id
        }"><span>${data.name.replace(
          /\(([^\)]*)\)/g,
          '<span>$1</span>'
        )}</span></a>`;
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

      $chart.addEventListener('mousemove', (x) => {
        const br = $chart.getBoundingClientRect();
        const indexMultiplier = br.width / 30;

        const index = Math.round(x.offsetX / indexMultiplier);
        if (metrics[index]) {
          populateMetadata($script, metrics[index], scriptData);
          $chartIndicator.setAttribute('cx', (index * 10).toString());
          $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
          $chartIndicatorLine.setAttribute('x1', (index * 10).toString());
          $chartIndicatorLine.setAttribute('x2', (index * 10).toString());
        }
      });
      $chart.addEventListener('touchmove', (e) => {
        const br = $chart.getBoundingClientRect();
        const x = e.touches[0].clientX - br.left;
        const index = Math.round(x / 10);
        if (metrics[index]) {
          populateMetadata($script, metrics[index], scriptData);
          $chartIndicator.setAttribute('cx', (index * 10).toString());
          $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
          $chartIndicatorLine.setAttribute('x1', (index * 10).toString());
          $chartIndicatorLine.setAttribute('x2', (index * 10).toString());
        }
      });
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

  addEventListener('popstate', (e) => {
    console.log(e);
  });

  $keywords?.addEventListener('input', (e) => {
    const keywords = $keywords.value.trim().toLowerCase();
    filterScripts(keywords);
    window.history.replaceState(
      {},
      document.title,
      keywords === '' ? window.location.pathname : `?q=${keywords}`
    );
  });

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
      $script.classList.toggle(
        'hidden',
        !(normalisedName && normalisedName.includes(keywords))
      );
    }
  });
}

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

document.querySelector('header')?.addEventListener('click', onHeaderClick);

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

document.querySelector('.intro')?.addEventListener('click', onIntroClick);

(async () => {
  KeyTrigger.delay = 5000;
  KeyTrigger.listenFor('528491').then(() => {
    document.body.classList.toggle('inception');
  });
  KeyTrigger.listenFor('party').then(() => {
    document.body.classList.toggle('party');
  });
})();
