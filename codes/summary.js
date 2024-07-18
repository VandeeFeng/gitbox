  async function sha(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex;
  }

  function cleanText(text) {
    // 移除 HTML 标签
    let cleanedText = text.replace(/<[^>]*>?/gm, '');
    // 移除多余的空格和换行
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    return cleanedText;
  }

  async function typeWriter(text, elementId) {
    document.getElementById("aitext").style.display = "none";
    let index = 0;
    const element = document.getElementById(elementId);
    const writeLetter = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(writeLetter, 30); // 调整时间来控制打字速度
      }
    };
    writeLetter();
  }

  async function ai_gen() {
    // 获取页面标题
    var postTitle = document.title;
    // 获取页面内容并清理
    var postContentRaw = document.getElementsByClassName('blog-content')[0].innerText; // var postContentRaw = document.querySelector('.blog-content').innerText;
    var postContent = cleanText(postContentRaw);

    // 创建包含标题和内容的对象
    var postData = {
      title: postTitle,
      content: postContent
    };

    // 将对象转换为JSON字符串
    var postContentJson = JSON.stringify(postData);

    // 创建签名
    var postContentSign = await sha(postContentJson);

    var outputContainer = document.getElementById("ai-output");

    // 构建请求URL
    const checkUploadedUrl = `https://summary.vandee.art/is_uploaded?id=${encodeURIComponent(location.href)}&sign=${postContentSign}`;
    const getSummaryUrl = `https://summary.vandee.art/get_summary?id=${encodeURIComponent(location.href)}&sign=${postContentSign}`;

    // 检查文章是否已上传并获取摘要
    try {
      let response = await fetch(checkUploadedUrl);
      if (!response.ok) {
        throw new Error(`Check uploaded error: status ${response.status}`);
      }
      let uploaded = await response.text();
      
      if (uploaded === "yes") {
        // 如果已上传，获取摘要
        response = await fetch(getSummaryUrl);
        if (!response.ok) {
          throw new Error(`Get summary error: status ${response.status}`);
        }
        let summaryText = await response.text();
        // 使用打字机效果显示摘要
        typeWriter(summaryText, 'ai-output');
      } else {
        // 如果文章未上传，上传文章内容
        let uploadBlogUrl = new URL("https://summary.vandee.art/upload_blog");
        uploadBlogUrl.search = new URLSearchParams({ id: encodeURIComponent(location.href) });
        response = await fetch(uploadBlogUrl, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: postContentJson
        });
        if (!response.ok) {
          throw new Error(`Upload blog error: status ${response.status}`);
        }
        // 等待上传完成再获取摘要
        await new Promise(r => setTimeout(r, 1000)); // 等待1秒，这里可以根据实际情况调整等待时间
        response = await fetch(getSummaryUrl);
        if (!response.ok) {
          throw new Error(`Get summary after upload error: status ${response.status}`);
        }
        summaryText = await response.text();
        typeWriter(summaryText, 'ai-output');
      }
    } catch (error) {
      console.error('Error:', error);
      outputContainer.textContent = 'Error: ' + error.message;
    }
  }

  // 确保DOM加载完成后执行ai_gen函数
  document.addEventListener('DOMContentLoaded', ai_gen);
