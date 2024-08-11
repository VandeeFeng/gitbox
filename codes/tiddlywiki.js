
  const fetchFeed = (url, elementId) => {
    fetch(url)
      .then((response) => response.text())
      .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then((data) => {
        const items = data.querySelectorAll('item');
        let html = '';
        html += `<p>${data.querySelector('description').innerHTML}</p>`;
        html += `<ul class='feeds'>`;
        items.forEach((el) => {
          html += `
            <li>
              <a href='${el.querySelector('link').innerHTML}' target='_blank' rel='noopener'>
                ${el.querySelector('title').innerHTML}
              </a>
            </li>
          `;
        });
        html += `</ul>`;
        document.getElementById(elementId).insertAdjacentHTML('beforeend', html);
      });
  };

  const fetchRecentArticles = (url, elementId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    fetch(url)
      .then(response => response.text())
      .then(xml => {
        const regex = /<item>(.*?)<\/item>/gs;
        let match;
        const recentArticles = [];

        while ((match = regex.exec(xml)) !== null && recentArticles.length < 10) {
          const item = match[1];
          const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/s.exec(item);
          const linkMatch = /<link>(.*?)<\/link>/s.exec(item);
          const titleMatch = /<title>(.*?)<\/title>/s.exec(item);
        
          if (pubDateMatch && linkMatch && titleMatch) {
            const pubDate = new Date(pubDateMatch[1]);
            pubDate.setHours(0, 0, 0, 0);
        
            if (pubDate <= today) {
              const formattedDate = pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              const link = linkMatch[1];
              const title = titleMatch[1];
              recentArticles.push({ pubDate: formattedDate, title, link });
            }
          }
        }
        
        recentArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        let message = '<p>Recent Vandee\'s Blog Posts:</p><ul>';
        recentArticles.forEach(article => {
          message += `<li><a href="${article.link}" target="_blank">${article.title}</a> (${article.pubDate})</li>`;
        });
        message += '</ul>';
        
        document.getElementById(elementId).innerHTML = message;
      })
      .catch(error => {
        console.error('Error fetching or parsing RSS:', error);
        document.getElementById(elementId).innerHTML = '<p>Error fetching blog posts. Please try again later.</p>';
      });
  };

  // 调用两个函数
  fetchFeed('https://dg.vandee.art/index.xml', 'feed');
  fetchRecentArticles('https://www.vandee.art/index.xml', 'rssFeed');
