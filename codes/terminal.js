// 获取HTML元素
const output = document.getElementById('output');
const cmdline = document.getElementById('cmdline');



function processCommand(command) {
  const trimmedCommand = command.trim().toLowerCase();

  if (trimmedCommand === 'help') {
    showHelpMessage();
  } else if (trimmedCommand === 'clear') {
    clearTerminal();
  } else if (commandHandlers[trimmedCommand]) {
    commandHandlers[trimmedCommand].handler();
  } else if (trimmedCommand.startsWith('echo ')) {
    printMessage(trimmedCommand.slice(5));
  } else if (trimmedCommand !== '') {
    printCommandNotFound(command);
  }

  // 只有在输出内容的情况下才滚动到底部
  if (output.innerHTML.trim() !== '') {
    output.scrollTop = output.scrollHeight;
  }
}

function showHelpMessage() {
  const commandDescriptions = Object.values(commandHandlers).map(handler => ({
    name: handler.name,
    description: handler.description
  }));
  let helpMessage = '<p>Available commands:</p>';
  for (const { name, description } of commandDescriptions) {
    helpMessage += `<p><span class="command-name">${name}</span> - ${description}</p>`;
  }
  output.innerHTML += helpMessage;
}

function clearTerminal() {
  output.innerHTML = '';
}

function printMessage(message) {
  output.innerHTML += `<p>${message}</p>`;
}

function mdMessage(message) {
  output.innerHTML += `${message}`;
}
  
function printCommandNotFound(command) {
  output.innerHTML += `<p>Command not found: ${command}</p>`;
}

// 命令处理函数集合
const commandHandlers = {
  help: {
    name: 'help',
    description: 'Show available commands',
    handler: showHelpMessage
  },
  clear: {
    name: 'clear',
    description: 'Clear the terminal output',
    handler: clearTerminal
  },
   ls: {
    name: 'ls',
    description: 'Display my website',
    handler: () => {
      const links = [
        { href: 'https://www.vandee.art/blog', text: 'Blog' },
        { href: 'https://dg.vandee.art', text: 'Digital Garden' },
      ];
      const linkElements = links.map(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        a.classList.add('custom-link');
        a.target = '_blank';
        return a;
      });
      const container = document.createElement('div');
      container.classList.add('link-container');
      linkElements.forEach(link => {
        container.appendChild(link);
        if (link !== linkElements[linkElements.length - 1]) {
          const span = document.createElement('span');
          span.textContent = ' | ';
          container.appendChild(span);
        }
      });
      mdMessage(container.outerHTML);
    }
   },
    
fe: {
  name: 'fe-featured',
  description: 'Display my featured posts',
  handler: () => {
    const links = [
      { href: 'https://www.vandee.art/posts/2024-05-22-org-pkm-manual/', text: 'PKM（个人知识管理）构建手册 - Emacs' },
      { href: 'https://www.vandee.art/posts/2024-08-02-nvim-pkm-manual/', text: 'PKM（个人知识管理）构建手册 - Nvim' },
      { href: 'https://www.vandee.art/posts/2023-12-06-learn-all-the-time/', text: 'Learn All The Time' },
      { href: 'https://www.vandee.art/posts/2024-05-05-the-value-of-art/', text: '也说说艺术的价值' },
      { href: 'https://www.vandee.art/posts/2024-03-03-a-monkey-shaking-the-branch/', text: '摇树枝的猴子' },
      { href: 'https://www.vandee.art/posts/2023-11-20-get-rich-slow/', text: '富有的概率' },
      { href: 'https://www.vandee.art/posts/2023-06-23-perfect-is-shit/', text: 'Perfect is shit' },
      { href: 'https://www.vandee.art/posts/2024-01-12-ju-wai-ren/', text: '局外人' },
    ];
    const linkList = document.createElement('ul');
    linkList.classList.add('link-list');
    links.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      a.classList.add('custom-link');
      a.target = '_blank';
      li.appendChild(a);
      linkList.appendChild(li);
    });
    mdMessage('<p>Featured Posts:</p>'+linkList.outerHTML);
  }
},



   're': {
    name: 're-recent',
    description: 'Display recent blog posts',
    handler: () => {
      // 目标网页的 RSS 地址
      const rssUrl = 'https://www.vandee.art/index.xml';
      // 获取当前日期的字符串表示，格式为 YYYY-MM-DD
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 将时间部分设置为零时零分零秒

      // 获取 RSS 数据并生成文章列表
      fetch(rssUrl)
        .then(response => response.text())
        .then(xml => {
          // 使用正则表达式提取每个 <item> 部分的日期、标题和链接
          const regex = /<item>(.*?)<\/item>/gs;
          let match;
          const recentArticles = [];

          while ((match = regex.exec(xml)) !== null && recentArticles.length < 10) {
            // 从 <item> 部分中提取日期、标题和链接
            const item = match[1];
            const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/s.exec(item);
            const linkMatch = /<link>(.*?)<\/link>/s.exec(item);
            const titleMatch = /<title>(.*?)<\/title>/s.exec(item);

            if (pubDateMatch && linkMatch && titleMatch) {
              const pubDate = new Date(pubDateMatch[1]);
              pubDate.setHours(0, 0, 0, 0); // 将时间部分设置为零时零分零秒

              // 如果文章日期早于或等于今天，则将其添加到列表中
              if (pubDate <= today) {
                const formattedDate = pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const link = linkMatch[1];
                const title = titleMatch[1];
                recentArticles.push({ pubDate: formattedDate, title, link });
              }
            }
          }

          // 对提取的文章按照日期从新到旧排序
          recentArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

          // 生成文章列表
          let message = '<p>Recent Blog Posts:</p><ul>';
          recentArticles.forEach(article => {
            message += `<li><a href="${article.link}" target="_blank">${article.title}</a> (${article.pubDate})</li>`;
          });
          message += '</ul>';
          mdMessage(message);
        })
        .catch(error => {
          console.error('Error fetching or parsing RSS:', error);
          printMessage('<p>Error fetching blog posts. Please try again later.</p>');
        });
    }
  },
  echo: {
    name: 'echo',
    description: 'Print the given message',
    handler: (message) => printMessage(message)
  }
};




// 监听用户输入
cmdline.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const command = cmdline.value.trim();
    cmdline.value = '';

    if (command !== '') {
      output.innerHTML += `<p><span style="color: #87d441;">$: </span>${command}</p>`;
      processCommand(command);
    }

    // 获取输入框相对于#terminal容器的位置
    const terminalRect = document.getElementById('terminal').getBoundingClientRect();
    const cmdlineRect = cmdline.getBoundingClientRect();
    const inputBoxRelativePos = cmdlineRect.top - terminalRect.top + cmdlineRect.height;

    // 如果输入框在容器的一半以下,则滚动容器
    if (inputBoxRelativePos > terminalRect.height / 2) {
      document.getElementById('terminal').scrollBy(0, inputBoxRelativePos - terminalRect.height / 2 + 1000);
    }
  }
});




