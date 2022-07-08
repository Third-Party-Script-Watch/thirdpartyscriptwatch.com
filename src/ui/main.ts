const $output = document.getElementById('output');

if ($output !== null) {
  let dataUrl = 'https://data.thirdpartyscriptwatch.com/data/metrics-30.json';
  if (process.env.NODE_ENV === 'development') {
    dataUrl = 'http://127.0.0.1:10000/devstoreaccount1/data/metrics-30.json';
  }

  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      $output.innerHTML = '';
      data.forEach((script) => {
        if (script.metrics.length < 30) {
          script.metrics = fillEmpty(script.metrics);
        }
        const $el = createScript(script);
        $output.appendChild($el);
      });
    });

  function fillEmpty(data) {
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

  function generatePoints(data) {
    const pointsArray: string[] = [];
    const range = getRange(data);
    data.forEach((x, i) => {
      pointsArray.push(
        `${i * 10}, ${102 - getPointHeight(x.contentLength, range)}`
      );
    });

    return pointsArray;
  }

  function getRange(data) {
    let min = data[0].contentLength;
    let max = data[0].contentLength;

    data.forEach((x) => {
      if (x.contentLength < min) {
        min = x.contentLength;
      }
      if (x.contentLength > max) {
        max = x.contentLength;
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

  function createScript(data) {
    const html = `<h2></h2>
    <p>Last retrieved: <span class="last-retrieved"></span></p>
    <p>
      Last size: <span class="last-size"></span> (<span
        class="last-size-uncompressed"
      ></span>
      uncompressed)
    </p>
    <svg viewBox="0 0 300 104" class="chart">
      <polyline
        class="chart-line"
        fill="none"
        stroke="#0074d9"
        stroke-width="2"
        points=""
      />
      <circle cx="-16" cy="-16" r="4" fill="#DB00FF" class="chart-indicator" />
    </svg>`;

    const $script = document.createElement('div');
    $script.className = 'script';
    $script.innerHTML = html;
    setElementText($script, 'h2', data.name);

    const dt = new Date(data.metrics[data.metrics.length - 1].retrieved);
    const contentLength = data.metrics[data.metrics.length - 1].contentLength;
    const contentLengthUncompressed =
      data.metrics[data.metrics.length - 1].contentLengthUncompressed;
    setElementText($script, '.last-retrieved', formatDate(dt));
    setElementText($script, '.last-size', formatSize(contentLength));
    setElementTitle($script, '.last-size', `${contentLength} bytes`);
    setElementText(
      $script,
      '.last-size-uncompressed',
      formatSize(contentLengthUncompressed)
    );
    setElementTitle(
      $script,
      '.last-size-uncompressed',
      `${contentLengthUncompressed} bytes`
    );

    const $chartLine = $script.querySelector('.chart-line');
    const points = generatePoints(data.metrics);
    if ($chartLine !== null) {
      $chartLine.setAttribute('points', points.join('\n'));
    }

    const $chart = $script.querySelector<SVGElement>('.chart');
    if ($chart !== null) {
      attachHandlers($chart, data.metrics, points);
    }

    return $script;
  }

  function attachHandlers($chart: SVGElement, data, points) {
    const $metrics = document.querySelector<HTMLElement>('.metrics');
    const $chartIndicator =
      $chart.querySelector<HTMLElement>('.chart-indicator');

    if ($metrics !== null && $chartIndicator !== null) {
      $chart.addEventListener('mouseout', () => {
        $metrics.style.display = 'none';
      });
      $chart.addEventListener('mousemove', (x) => {
        const index = Math.round(x.offsetX / 10);
        if (data[index]) {
          const dt = new Date(data[index].retrieved);
          $metrics.innerHTML = `
        Date: ${formatDate(dt)}<br>
        Size: ${
          data[index].contentLength === -1
            ? '-'
            : formatSize(data[index].contentLength)
        }<br>
        Encoding: ${
          data[index].contentLength === -1 ? '-' : data[index].contentEncoding
        }
      `;
          $metrics.style.display = 'block';
          $metrics.style.top = x.pageY - x.offsetY - 58 + 'px';
          if (x.clientX - 60 + 152 > window.innerWidth) {
            $metrics.style.left = x.clientX - 60 - 152 + 'px';
          } else {
            $metrics.style.left = x.clientX - 60 + 'px';
          }

          $chartIndicator.setAttribute('cx', (index * 10).toString());
          $chartIndicator.setAttribute('cy', points[index].split(', ')[1]);
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
