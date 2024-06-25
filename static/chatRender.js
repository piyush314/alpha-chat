const isMarkedAvailable = typeof marked !== 'undefined';

if (!isMarkedAvailable) {
  console.warn('Marked library is not available. Markdown rendering will be disabled.');
}

// Custom renderer for marked
const renderer = new marked.Renderer();
renderer.text = function (text) {
  if (typeof text !== 'string') {
    console.warn('Received non-string text in renderer:', text);
    return String(text); // Convert to string if it's not already
  }

  const specialTags = [
    'missing_info',
    'logical_inconsistency',
    'undefined_concept',
    'assumed_prerequisite',
    'irrelevant_content',
    'flow_gap'
  ];

  specialTags.forEach(tag => {
    const regex = new RegExp(`<${tag}>(.+?)</${tag}>`, 'g');
    text = text.replace(regex, (match, p1) =>
      `<span class="special-tag ${tag.replace('_', '-')}">${p1}</span>`
    );
  });

  return text;
};
// Configure marked to use the custom renderer
marked.use({ renderer });

export function addMessage(sender, text, chatMessages) {
  console.log(`Adding message from ${sender}: ${text}`);
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${sender}-message`);

  if (isMarkedAvailable) {
    try {
      // Parse and render the Markdown content
      let renderedContent = marked.parse(text);

      // Process special tags after Markdown rendering
      renderedContent = processSpecialTags(renderedContent);
      // Process maths 
      renderedContent = renderMath(renderedContent);

      messageElement.innerHTML = renderedContent;

      // Apply syntax highlighting to code blocks
      if (typeof hljs !== 'undefined') {
        messageElement.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }
    } catch (error) {
      console.error('Error parsing Markdown:', error);
      messageElement.textContent = text;
    }
  } else {
    // Fallback to plain text if Markdown parsing is not available
    messageElement.textContent = text;
  }

  chatMessages.appendChild(messageElement);
  scrollToBottom(chatMessages);
}

// Process special tags
function processSpecialTags(content) {
    const specialTags = [
      'missing_info',
      'logical_inconsistency',
      'undefined_concept',
      'assumed_prerequisite',
      'irrelevant_content',
      'flow_gap'
    ];

    const regex = new RegExp(`<(${specialTags.join('|')})>(.+?)</\\1>`, 'g');
    return content.replace(regex, (match, tag, content) =>
      `<span class="special-tag ${tag.replace('_', '-')}">${content}</span>`
    );
  }
// Render maths and equations
function renderMath(content) {
  return content.replace(/\$\$(.*?)\$\$/g, (match, p1) => {
    return katex.renderToString(p1, { throwOnError: false });
  });
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}
