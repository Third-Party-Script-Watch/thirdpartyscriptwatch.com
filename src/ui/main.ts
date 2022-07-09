const $output = document.getElementById('output');

if ($output !== null) {
  let dataUrl = 'https://data.thirdpartyscriptwatch.com/data/metrics-30.json';
  if (process.env.NODE_ENV === 'development') {
    // TODO: Need to come up with a way to do this without Azure Storage Emulator running
    dataUrl = 'http://127.0.0.1:10000/devstoreaccount1/data/metrics-30.json';
  }

  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      $output.innerHTML = '';
      data.forEach((script) => {
        script.metrics = groupSubresources(script.metrics);
        if (script.metrics.length < 30) {
          script.metrics = fillEmpty(script.metrics);
        }
        const $el = createScript(script);
        $output.appendChild($el);
      });
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
      const startDate = new Date(data[0].retrieved);
      data = data.reverse();
      while (data.length < 30) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() - data.length + 1);
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

  function populateMetadata($script, metric) {
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
        <p><strong>Initial script:</strong> <span class="size"></span></p>
        <p><strong class="subresources-label"></strong> <span class="subresources-size"></span></p>`;

      const contentLength = metric.contentLength;
      const subresourcesSize = subresources
        .map((x) => x.contentLength)
        .reduce((a, b) => a + b, 0);

      $script.querySelector('.metadata').innerHTML = html;

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
    const html = `<h2></h2>
    <div class="metadata"></div>
    <svg viewBox="0 0 300 104" class="chart">
      <polyline
        class="chart-line"
        fill="none"
        stroke="#0074d9"
        stroke-width="1"
        points=""
      />
      <line x1="1" y1="1" x2="1" y2="104" stroke="#CCCCCC" class="chart-indicator-line"/>
      <circle cx="-16" cy="-16" r="2" fill="#DB00FF" class="chart-indicator" />
    </svg>`;

    const $script = document.createElement('div');
    $script.className = 'script';
    $script.innerHTML = html;
    setElementText($script, 'h2', data.name);

    populateMetadata($script, data.metrics[data.metrics.length - 1]);

    const $chartLine = $script.querySelector('.chart-line');
    const points = generatePoints(data.metrics);
    if ($chartLine !== null) {
      $chartLine.setAttribute('points', points.join('\n'));
    }

    const $chart = $script.querySelector<SVGElement>('.chart');
    if ($chart !== null) {
      attachHandlers($script, $chart, data.metrics, points);
    }

    return $script;
  }

  function attachHandlers(
    $script: HTMLElement,
    $chart: SVGElement,
    metrics,
    points
  ) {
    const $chartIndicator =
      $chart.querySelector<HTMLElement>('.chart-indicator');
    const $chartIndicatorLine = $chart.querySelector<HTMLElement>(
      '.chart-indicator-line'
    );

    if ($chartIndicator !== null && $chartIndicatorLine !== null) {
      $chart.addEventListener('mousemove', (x) => {
        const index = Math.round(x.offsetX / 10);
        if (metrics[index]) {
          populateMetadata($script, metrics[index]);
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