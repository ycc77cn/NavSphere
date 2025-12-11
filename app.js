(function () {
  "use strict";

  // 工具函数与类型校验
  function isString(v) { return typeof v === "string"; }
  function isBool(v) { return typeof v === "boolean"; }
  function isArray(v) { return Array.isArray(v); }
  function isLikelyUrl(str) {
    return /^https?:\/\//.test(str) || str.startsWith("/") || /^[.]{1,2}\//.test(str);
  }
  function sanitizeUrl(url) {
    if (!isString(url) || !url) return "#";
    try {
      const u = new URL(url, window.location.href);
      return u.href;
    } catch (e) {
      return "#";
    }
  }
  function normalizeIconSrc(icon) {
    if (!isString(icon) || !icon.trim()) return "";
    const i = icon.trim();
    if (/^https?:\/\//.test(i)) return i;
    if (i.startsWith("/assets")) {
      const rel = "." + i; // "/assets/..." -> "./assets/..."
      try { return new URL(rel, window.location.href).href; } catch { return rel; }
    }
    if (i.startsWith("/")) {
      const rel = "." + i; // "/x.png" -> "./x.png"
      try { return new URL(rel, window.location.href).href; } catch { return rel; }
    }
    if (/^[.]{1,2}\//.test(i)) {
      try { return new URL(i, window.location.href).href; } catch { return i; }
    }
    try { return new URL(i, window.location.href).href; } catch { return i; }
  }

  function normalizeItem(raw) {
    const title = isString(raw && raw.title) ? raw.title : "未命名工具";
    const icon = isString(raw && raw.icon) ? raw.icon : "";
    return {
      id: raw && raw.id,
      title,
      href: sanitizeUrl(raw && raw.href),
      description: isString(raw && raw.description) ? raw.description : "",
      icon: normalizeIconSrc(icon),
      enabled: isBool(raw && raw.enabled) ? raw.enabled : false,
    };
  }

  // 复制功能
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((resolve, reject) => {
        document.execCommand('copy') ? resolve() : reject();
        textArea.remove();
      });
    }
  }

  // 显示复制成功提示
  function showCopyToast() {
    // 移除现有的提示
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = '复制成功！';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // 显示分类/子类简介提示
  function showCategoryTooltip(element, title, description) {
    // 移除现有的提示
    const existingTooltip = document.querySelector('.category-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'category-tooltip';
    
    // 构建提示内容
    const titleEl = document.createElement('div');
    titleEl.className = 'tooltip-title';
    titleEl.textContent = title;
    
    const descEl = document.createElement('div');
    descEl.className = 'tooltip-description';
    descEl.textContent = description || '暂无简介';
    
    tooltip.appendChild(titleEl);
    if (description && description.trim()) {
      tooltip.appendChild(descEl);
    }
    
    document.body.appendChild(tooltip);

    // 计算位置
    const rect = element.getBoundingClientRect();
    const margin = 8;
    const maxWidth = Math.min(400, window.innerWidth - margin * 2);
    tooltip.style.maxWidth = maxWidth + 'px';
    tooltip.style.visibility = 'hidden';

    // 初步放置在元素下方
    let top = rect.bottom + margin;
    let left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - maxWidth));

    // 显示以测量实际尺寸
    tooltip.style.visibility = 'visible';
    const tooltipRect = tooltip.getBoundingClientRect();

    // 如果下方放不下，改放到上方
    if (top + tooltipRect.height + margin > window.innerHeight) {
      top = Math.max(margin, rect.top - margin - tooltipRect.height);
    }
    // 如果右侧溢出，左移
    if (left + tooltipRect.width + margin > window.innerWidth) {
      left = Math.max(margin, window.innerWidth - margin - tooltipRect.width);
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';

    return tooltip;
  }

  // 创建复制按钮
  function createCopyButton(item, catTitle, subTitle = null) {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.title = '复制工具信息';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;

    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // 阻止卡片点击事件
      e.preventDefault();
      
      // 构建复制文本：一级分类 - 二级分类 - 工具名称 - 链接 - 工具介绍
      const parts = [catTitle];
      if (subTitle) parts.push(subTitle);
      parts.push(item.title, item.href, item.description);
      const copyText = parts.join(' - ');
      
      try {
        await copyToClipboard(copyText);
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        showCopyToast();
        
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `;
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        // 可以在这里添加错误提示
      }
    });

    return btn;
  }

  // DOM 引用
  const headerEl = document.querySelector('.site-header');
  const categoryBar = document.getElementById("categoryBar");
  const subcategoryPanel = document.getElementById("subcategoryPanel");
  const content = document.getElementById("content");
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClearBtn = document.getElementById('searchClear');

  // 状态
  let navData = [];
  let activeCategoryIdx = 0;
  let searchIndex = []; // 每条含 elementId 便于精确定位
  let searchActiveIdx = -1;
  let searchCurrentList = [];

  function computeStickyOffsets() {
    const root = document.documentElement;
    const headerH = headerEl ? headerEl.offsetHeight : 64;
    const catH = categoryBar ? categoryBar.offsetHeight : 44;
    const subH = subcategoryPanel ? subcategoryPanel.offsetHeight : 40;
    root.style.setProperty('--top-header', headerH + 'px');
    root.style.setProperty('--top-category', (headerH) + 'px');
    root.style.setProperty('--top-subcategory', (headerH + catH) + 'px');
    root.style.setProperty('--sticky-offset', (headerH + catH + subH + 16) + 'px');
  }

  function scrollToId(id) {
    if (!isString(id) || !id) return;
    const el = document.getElementById(id);
    if (!el) return;
    // 计算粘性头部的总高度，保证目标在二级分类下方
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue('--sticky-offset').trim();
    const fallback = 120; // 兜底偏移
    let offset = fallback;
    if (raw) {
      const px = parseFloat(raw.replace('px', ''));
      if (!isNaN(px)) offset = px;
    }
    const rect = el.getBoundingClientRect();
    const current = window.scrollY || window.pageYOffset;
    const targetY = rect.top + current - offset;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
  }

  function renderTopBars() {
    if (!categoryBar) return;
    categoryBar.innerHTML = "";
    navData.forEach((cat, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-item' + (idx === activeCategoryIdx ? ' active' : '');
      btn.textContent = isString(cat.title) ? cat.title : `分类 ${idx + 1}`;
      btn.dataset.catId = String(cat.id);
      btn.addEventListener('click', () => {
        activeCategoryIdx = idx;
        renderTopBars();
        renderSubcategoriesPanel(cat);
        const targetId = `cat-${cat.id}`;
        history.replaceState(null, '', `#${targetId}`);
        scrollToId(targetId);
        highlightSection(targetId);
      });

      // 添加悬停显示简介功能
      let hoverTimer = null;
      let tooltipEl = null;
      
      btn.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          if (isString(cat.description) && cat.description.trim()) {
            tooltipEl = showCategoryTooltip(btn, cat.title, cat.description);
          }
        }, 300);
      });
      
      btn.addEventListener('mouseleave', () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        if (tooltipEl) {
          tooltipEl.remove();
          tooltipEl = null;
        }
      });
      
      categoryBar.appendChild(btn);
    });

    const current = navData[activeCategoryIdx];
    renderSubcategoriesPanel(current);
  }

  function renderSubcategoriesPanel(cat) {
    if (!subcategoryPanel) return;
    subcategoryPanel.innerHTML = "";
    const subs = isArray(cat && cat.subCategories) ? cat.subCategories : [];
    if (!subs.length) {
      const hint = document.createElement('div');
      hint.className = 'subcategory-empty';
      hint.textContent = '选择分类以浏览内容';
      subcategoryPanel.appendChild(hint);
      computeStickyOffsets();
      return;
    }
    subs.forEach((sub) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'subcategory-item';
      btn.textContent = isString(sub.title) ? sub.title : '子类';
      btn.dataset.subId = String(sub.id);
      btn.addEventListener('click', () => {
        const targetId = `sub-${sub.id}`;
        history.replaceState(null, '', `#${targetId}`);
        scrollToId(targetId);
        highlightSection(targetId);
      });

      // 添加悬停显示简介功能
      let hoverTimer = null;
      let tooltipEl = null;
      
      btn.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          if (isString(sub.description) && sub.description.trim()) {
            tooltipEl = showCategoryTooltip(btn, sub.title, sub.description);
          }
        }, 300);
      });
      
      btn.addEventListener('mouseleave', () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        if (tooltipEl) {
          tooltipEl.remove();
          tooltipEl = null;
        }
      });
      
      subcategoryPanel.appendChild(btn);
    });
    computeStickyOffsets();
  }

  // 更新二级分类面板显示，确保显示正确的二级分类
  function updateSubcategoriesPanelForSub(subId) {
    if (!subcategoryPanel) return;
    
    // 找到包含这个二级分类的一级分类
    const catIdx = navData.findIndex(c => (c.subCategories || []).some(s => String(s.id) === subId));
    if (catIdx >= 0) {
      activeCategoryIdx = catIdx;
      const currentCat = navData[activeCategoryIdx];
      renderSubcategoriesPanel(currentCat);
    }
  }

  function makeSectionTitle(tag, text, desc) {
    const wrap = document.createElement('div');
    wrap.className = 'section-title';
    const h = document.createElement(tag);
    h.textContent = text;
    wrap.appendChild(h);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      wrap.appendChild(p);
    }
    return wrap;
  }

  function renderItemsGrid(items, container, ctx) {
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    
    // 获取一级分类标题
    const cat = navData.find(c => String(c.id) === ctx.catId);
    const catTitle = cat ? (cat.title || '未命名分类') : '未命名分类';
    
    // 获取二级分类标题
    let subTitle = null;
    if (ctx.subId && cat && cat.subCategories) {
      const sub = cat.subCategories.find(s => String(s.id) === ctx.subId);
      subTitle = sub ? (sub.title || '未命名子类') : null;
    }
    
    items.forEach((raw, idx) => {
      const item = normalizeItem(raw);
      if (!item.enabled) return;
      const card = document.createElement('article');
      card.className = 'card';

      // 分配稳定的元素 ID 以用于精确定位
      const key = item.id ? String(item.id) : String(idx);
      const subKey = ctx.subId ? String(ctx.subId) : 'root';
      const elementId = `item-${ctx.catId}-${subKey}-${key}`;
      card.id = elementId;
      card.dataset.catId = String(ctx.catId);
      if (ctx.subId) card.dataset.subId = String(ctx.subId);
      card.dataset.itemKey = key;

      const head = document.createElement('div');
      head.className = 'card-head';

      const iconBox = document.createElement('div');
      iconBox.className = 'card-icon';
      const titleText = item.title || '📦';
      if (item.icon && isLikelyUrl(item.icon)) {
        const img = document.createElement('img');
        img.alt = 'icon';
        img.src = item.icon;
        img.onerror = function () {
          img.remove();
          iconBox.textContent = titleText.charAt(0);
        };
        iconBox.appendChild(img);
      } else {
        iconBox.textContent = titleText.charAt(0);
      }

      const titleEl = document.createElement('div');
      titleEl.className = 'card-title';
      const link = document.createElement('a');
      link.href = item.href || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = titleText;
      titleEl.appendChild(link);

      head.appendChild(iconBox);
      head.appendChild(titleEl);

      const desc = document.createElement('div');
      desc.className = 'card-desc';
      desc.textContent = item.description || '暂无简介';

      card.appendChild(head);
      card.appendChild(desc);
      
      // 添加复制按钮，传递分类信息
      const copyBtn = createCopyButton(item, catTitle, subTitle);
      card.appendChild(copyBtn);
      
      // 让整张卡片可点击（除了复制按钮）
      card.tabIndex = 0;
      card.setAttribute('role','link');
      card.setAttribute('aria-label', titleText);
      const openLink = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('button,input,textarea,select,label')) return;
        const url = link && link.href ? link.href : (item.href || '#');
        if (!url || url === '#') return;
        window.open(url, '_blank', 'noopener,noreferrer');
      };
      card.addEventListener('click', openLink);
      card.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openLink(ev);
        }
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  function renderAllSections() {
    if (!content) return;
    content.innerHTML = '';

    navData.forEach(cat => {
      // 创建一级分类容器（最外层）
      const catSec = document.createElement('section');
      catSec.className = 'section category-section';
      const catId = `cat-${cat.id}`;
      catSec.id = catId;
      
      // 创建一级分类标题（与容器一体化）
      const catTitle = makeSectionTitle('h2', isString(cat.title) ? cat.title : '分类', isString(cat.description) ? cat.description : '');
      catSec.appendChild(catTitle);
      
      // 创建内容区域容器
      const catContent = document.createElement('div');
      catContent.className = 'category-content';

      const subs = isArray(cat.subCategories) ? cat.subCategories : [];
      if (subs.length) {
        // 创建二级分类组容器
        const subsContainer = document.createElement('div');
        subsContainer.className = 'subcategories-container';
        
        subs.forEach(sub => {
          const subSec = document.createElement('section');
          subSec.className = 'section subcategory-section';
          const subId = `sub-${sub.id}`;
          subSec.id = subId;
          
          // 创建二级分类标题
          const subTitle = makeSectionTitle('h3', isString(sub.title) ? sub.title : '子类', isString(sub.description) ? sub.description : '');
          subSec.appendChild(subTitle);
          
          const items = isArray(sub.items) ? sub.items : [];
          renderItemsGrid(items, subSec, { catId: String(cat.id), subId: String(sub.id) });
          subsContainer.appendChild(subSec);
        });
        
        catContent.appendChild(subsContainer);
      } else {
        // 直接在一级分类下的工具内容（无二级分类时）
        const items = isArray(cat.items) ? cat.items : [];
        renderItemsGrid(items, catContent, { catId: String(cat.id) });
      }

      catSec.appendChild(catContent);
      content.appendChild(catSec);
    });
  }

  function tryActivateFromHash() {
    const hash = location.hash.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    if (hash.startsWith('cat-')) {
      const catId = hash.slice(4);
      const idx = navData.findIndex(c => String(c.id) === catId);
      if (idx >= 0) activeCategoryIdx = idx;
    } else if (hash.startsWith('sub-')) {
      const subId = hash.slice(4);
      const catIdx = navData.findIndex(c => (c.subCategories || []).some(s => String(s.id) === subId));
      if (catIdx >= 0) activeCategoryIdx = catIdx;
    }
  }

  function setupScrollHighlight() {
    let ticking = false;
    
    function updateActiveSection() {
      const sections = document.querySelectorAll('.category-section, .subcategory-section');
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sticky-offset') || '120');
      
      let activeSection = null;
      let closestDistance = Infinity;
      
      // 找到距离视口顶部最近且可见的section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        
        // 计算section顶部到视口顶部的距离
        const distance = Math.abs(rect.top - offset);
        
        // 如果section在视口内或接近视口顶部
        if (rect.top <= offset + 100 && distance < closestDistance) {
          activeSection = section;
          closestDistance = distance;
        }
      }
      
      if (activeSection) {
        // 如果是二级分类，需要更新二级分类面板
        if (activeSection.id.startsWith('sub-')) {
          const subId = activeSection.id.slice(4);
          updateSubcategoriesPanelForSub(subId);
        }
        // 如果是没有二级分类的一级分类，确保显示正确的分类
        else if (activeSection.id.startsWith('cat-')) {
          const catId = activeSection.id.slice(4);
          const catIdx = navData.findIndex(c => String(c.id) === catId);
          if (catIdx >= 0) {
            activeCategoryIdx = catIdx;
            const currentCat = navData[activeCategoryIdx];
            renderSubcategoriesPanel(currentCat);
          }
        }
        
        highlightSection(activeSection.id);
      }
      
      ticking = false;
    }
    
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== 全局搜索 =====
  function buildSearchIndex() {
    const idx = [];
    navData.forEach(cat => {
      const catTitle = isString(cat.title) ? cat.title : '';
      const catDesc = isString(cat.description) ? cat.description : '';
      idx.push({ type: 'category', id: String(cat.id), title: catTitle, description: catDesc, catId: String(cat.id), catTitle, elementId: `cat-${cat.id}` });
      const subs = isArray(cat.subCategories) ? cat.subCategories : [];
      if (subs.length) {
        subs.forEach(sub => {
          const subTitle = isString(sub.title) ? sub.title : '';
          const subDesc = isString(sub.description) ? sub.description : '';
          idx.push({ type: 'subcategory', id: String(sub.id), title: subTitle, description: subDesc, catId: String(cat.id), subId: String(sub.id), catTitle, subTitle, elementId: `sub-${sub.id}` });
          const items = isArray(sub.items) ? sub.items : [];
          items.forEach((it, i) => {
            const n = normalizeItem(it);
            if (!n.enabled) return;
            const key = n.id ? String(n.id) : String(i);
            const elementId = `item-${cat.id}-${sub.id}-${key}`;
            idx.push({ type: 'item', id: n.id ? String(n.id) : undefined, title: n.title, description: n.description, catId: String(cat.id), subId: String(sub.id), catTitle, subTitle, elementId });
          });
        });
      } else {
        const items = isArray(cat.items) ? cat.items : [];
        items.forEach((it, i) => {
          const n = normalizeItem(it);
          if (!n.enabled) return;
          const key = n.id ? String(n.id) : String(i);
          const elementId = `item-${cat.id}-root-${key}`;
          idx.push({ type: 'item', id: n.id ? String(n.id) : undefined, title: n.title, description: n.description, catId: String(cat.id), catTitle, elementId });
        });
      }
    });
    searchIndex = idx;
  }

  function renderSearchResults(list) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    if (!list || !list.length) {
      searchResults.hidden = true;
      return;
    }
    list.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'search-item' + (i === searchActiveIdx ? ' active' : '');
      row.setAttribute('role', 'option');
      row.dataset.type = e.type;
      row.dataset.catId = e.catId || '';
      if (e.subId) row.dataset.subId = e.subId;
      row.dataset.elementId = e.elementId || '';
      row.innerHTML = `
        <span class="pill${e.type === 'item' ? ' pill--logo' : ''}">${e.type === 'item' ? '<img src="https://pic1.imgdb.cn/item/68f1b8ccc5157e1a887a8c09.png" alt="logo" class="pill-logo" />' : e.type === 'subcategory' ? '子类' : '分类'}</span>
        <span class="title">${e.title || '(未命名)'}</span>
        <span class="meta">${e.subTitle ? e.catTitle + ' / ' + e.subTitle : (e.catTitle || '')}</span>
      `;
      row.addEventListener('click', () => {
        // 点击后关闭悬浮描述并清除计时器
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
        const existed = document.querySelector('.search-tooltip');
        if (existed && existed.parentNode) existed.parentNode.removeChild(existed);
        // 保留原有跳转功能
        goToResult(e);
      });
      // 悬停提示（100ms 延时显示 description），固定定位到视口，确保不被容器裁剪
      let hoverTimer = null;
      let tipEl = null;
      row.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          const text = (e.description && e.description.trim()) ? e.description : '没有相关说明信息';
          // 清除可能存在的全局提示，避免叠加
          const existed = document.querySelector('.search-tooltip');
          if (existed && existed.parentNode) existed.parentNode.removeChild(existed);

          tipEl = document.createElement('div');
          tipEl.className = 'search-tooltip';
          tipEl.textContent = text;
          tipEl.style.visibility = 'hidden';
          document.body.appendChild(tipEl);

          // 以目标行在视口中的位置计算
          const rect = row.getBoundingClientRect();
          const margin = 8;
          const maxWidth = Math.min(520, window.innerWidth - margin * 2);
          tipEl.style.maxWidth = maxWidth + 'px';

          // 初步放置在元素下方
          let top = rect.bottom + margin;
          let left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - maxWidth));

          // 显示以测量实际尺寸
          tipEl.style.visibility = 'visible';
          const tipRect = tipEl.getBoundingClientRect();

          // 如果下方放不下，改放到上方
          if (top + tipRect.height + margin > window.innerHeight) {
            top = Math.max(margin, rect.top - margin - tipRect.height);
          }
          // 如果右侧溢出，左移
          if (left + tipRect.width + margin > window.innerWidth) {
            left = Math.max(margin, window.innerWidth - margin - tipRect.width);
          }

          tipEl.style.top = top + 'px';
          tipEl.style.left = left + 'px';
        }, 100);
      });
      row.addEventListener('mouseleave', () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        if (tipEl && tipEl.parentNode) {
          tipEl.parentNode.removeChild(tipEl);
          tipEl = null;
        }
      });
      searchResults.appendChild(row);
    });
    searchResults.hidden = false;
  }

  function clearSearch(closeOnly) {
    searchActiveIdx = -1;
    searchCurrentList = [];
    if (searchInput && !closeOnly) searchInput.value = '';
    if (searchResults) searchResults.hidden = true;
    if (searchResults) searchResults.innerHTML = '';
  }

  function highlightSection(sectionId) {
    const sec = document.getElementById(sectionId);
    if (!sec) return;
    
    // 根据sectionId类型设置对应的高亮
    if (sectionId.startsWith('cat-')) {
      // 一级分类高亮
      const catId = sectionId.slice(4);
      
      // 移除所有分类按钮的高亮
      document.querySelectorAll('.category-item.active').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.subcategory-item.active').forEach(el => el.classList.remove('active'));
      
      // 设置当前一级分类按钮持续高亮
      const catBtn = document.querySelector(`.category-item[data-cat-id="${catId}"]`);
      if (catBtn) catBtn.classList.add('active');
      
      // 内容区域高亮1.8秒后消失
      sec.classList.add('highlight');
      setTimeout(() => sec.classList.remove('highlight'), 1800);
      
    } else if (sectionId.startsWith('sub-')) {
      // 二级分类高亮
      const subId = sectionId.slice(4);
      
      // 先更新二级分类面板，确保显示正确的二级分类
      updateSubcategoriesPanelForSub(subId);
      
      // 移除所有分类按钮的高亮
      document.querySelectorAll('.category-item.active').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.subcategory-item.active').forEach(el => el.classList.remove('active'));
      
      // 设置当前二级分类按钮持续高亮
      const subBtn = document.querySelector(`.subcategory-item[data-sub-id="${subId}"]`);
      if (subBtn) subBtn.classList.add('active');
      
      // 同时高亮对应的一级分类
      const catId = navData.findIndex(c => (c.subCategories || []).some(s => String(s.id) === subId));
      if (catId >= 0) {
        const catBtn = document.querySelector(`.category-item[data-cat-id="${navData[catId].id}"]`);
        if (catBtn) catBtn.classList.add('active');
      }
      
      // 内容区域高亮1.8秒后消失
      sec.classList.add('highlight');
      setTimeout(() => sec.classList.remove('highlight'), 1800);
      
    } else {
      // 其他元素高亮（仅内容区域，1.8秒后消失）
      sec.classList.add('highlight');
      setTimeout(() => sec.classList.remove('highlight'), 1800);
    }
  }

  function goToResult(entry) {
    if (!entry) return;
    // 定位所属分类
    const catIdx = navData.findIndex(c => String(c.id) === String(entry.catId));
    if (catIdx >= 0) activeCategoryIdx = catIdx;
    renderTopBars();
    const current = navData[activeCategoryIdx];
    renderSubcategoriesPanel(current);

    let targetId = '';
    if (entry.type === 'category') {
      targetId = entry.elementId || `cat-${entry.catId}`;
      history.replaceState(null, '', `#${targetId}`);
      scrollToId(targetId);
      highlightSection(targetId);
    } else if (entry.type === 'subcategory') {
      targetId = entry.elementId || `sub-${entry.subId}`;
      history.replaceState(null, '', `#${targetId}`);
      scrollToId(targetId);
      highlightSection(targetId);
    } else {
      // 精确到工具卡片
      targetId = entry.elementId;
      if (!targetId) {
        // 回退：如果缺少 elementId 则定位到所属子类/分类
        targetId = entry.subId ? `sub-${entry.subId}` : `cat-${entry.catId}`;
      }
      history.replaceState(null, '', `#${targetId}`);
      scrollToId(targetId);
      setTimeout(() => {
        const el = document.getElementById(entry.elementId);
        if (el && el.classList.contains('card')) {
          // 使用更明显的高亮效果
          el.classList.add('search-highlight');
          setTimeout(() => el.classList.remove('search-highlight'), 3000);
        } else if (targetId) {
          highlightSection(targetId);
        }
      }, 300);
    }

    clearSearch(true);
  }

  function bindSearch() {
    if (!searchInput) return;

    function doFilter() {
      const q = (searchInput.value || '').trim().toLowerCase();
      searchActiveIdx = -1;
      if (!q) { clearSearch(true); return; }
      // 简单包含匹配（标题>描述）
      searchCurrentList = searchIndex.filter(e => {
        const t = (e.title || '').toLowerCase();
        const d = (e.description || '').toLowerCase();
        return t.includes(q) || d.includes(q);
      }).slice(0, 50);
      renderSearchResults(searchCurrentList);
    }

    searchInput.addEventListener('input', doFilter);
    searchInput.addEventListener('focus', () => { doFilter(); });
    searchInput.addEventListener('keydown', (ev) => {
      const visible = searchResults && !searchResults.hidden;
      if (!visible) return;
      const items = Array.from(searchResults.querySelectorAll('.search-item'));
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        searchActiveIdx = (searchActiveIdx + 1) % items.length;
        renderSearchResults(searchCurrentList);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        searchActiveIdx = (searchActiveIdx - 1 + items.length) % items.length;
        renderSearchResults(searchCurrentList);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        const idx = searchActiveIdx >= 0 ? searchActiveIdx : 0;
        const entry = searchCurrentList[idx];
        if (entry) {
          goToResult(entry);
        }
      } else if (ev.key === 'Escape') {
        clearSearch();
      }
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => clearSearch());
    }

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!searchResults) return;
      const inSearch = e.target === searchInput || searchResults.contains(e.target);
      if (!inSearch) clearSearch(true);
    });
  }

  async function init() {
    try {
      const res = await fetch('./navsphere/content/navigation.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('数据加载失败：' + res.status);
      const raw = await res.json();
      if (!raw || !isArray(raw.navigationItems)) {
        throw new Error('数据格式错误：应为 { navigationItems: [] }');
      }
      navData = raw.navigationItems.filter(cat => isBool(cat.enabled) ? cat.enabled : true);
      if (!navData.length) throw new Error('暂无可用分类');

      tryActivateFromHash();
      renderTopBars();
      renderAllSections();
      computeStickyOffsets();
      buildSearchIndex();
      bindSearch();
      setupScrollHighlight();

      window.addEventListener('resize', computeStickyOffsets);
    } catch (e) {
      console.error(e);
      if (content) {
        content.innerHTML = '<div style="padding:12px;border:1px solid #d99;background:#fff0f0">未能加载数据，请确认 navigation.json 存在且内容有效。</div>';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
