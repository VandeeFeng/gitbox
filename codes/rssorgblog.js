  fetch('https://www.vandee.art/rss.xml')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then((data) => {
      const items = data.querySelectorAll('item');
      let html = '';
      html += `<p>Recent posts from ${data.querySelector('description').textContent}</p>`;
      html += `<ul class='feeds'>`;

      // 只处理前十个更新
      const maxItems = Math.min(items.length, 10);
      for (let i = 0; i < maxItems; i++) {
        const el = items[i];
        const title = el.querySelector('title').textContent;
        const link = el.querySelector('link').textContent;
        const pubDate = el.querySelector('pubDate').textContent;

        // 解析和格式化日期
        const date = new Date(pubDate);
        const formattedDate = date.toISOString().split('T')[0]; // 获取 YYYY-MM-DD 格式

        html += `
          <li>
            <a href='${link}' target='_blank' rel='noopener'>
              ${title} (${formattedDate})
            </a>
          </li>
        `;
      }

      html += `</ul>`;
      document.getElementById('feed').insertAdjacentHTML('beforeend', html);
    })
    .catch((error) => {
      console.error('Error fetching the RSS feed:', error);
    });
