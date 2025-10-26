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
      btn.addEventListener('click', () => {
        activeCategoryIdx = idx;
        renderTopBars();
        renderSubcategoriesPanel(cat);
        const targetId = `cat-${cat.id}`;
        history.replaceState(null, '', `#${targetId}`);
        scrollToId(targetId);
        highlightSection(targetId);
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
      btn.addEventListener('click', () => {
        const targetId = `sub-${sub.id}`;
        history.replaceState(null, '', `#${targetId}`);
        scrollToId(targetId);
        highlightSection(targetId);
      });
      subcategoryPanel.appendChild(btn);
    });
    computeStickyOffsets();
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
      // 让整张卡片可点击
      card.tabIndex = 0;
      card.setAttribute('role','link');
      card.setAttribute('aria-label', titleText);
      const openLink = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('a,button,input,textarea,select,label')) return;
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
      const catSec = document.createElement('section');
      catSec.className = 'section category-section';
      const catId = `cat-${cat.id}`;
      catSec.id = catId;
      catSec.appendChild(makeSectionTitle('h2', isString(cat.title) ? cat.title : '分类', isString(cat.description) ? cat.description : ''));

      const subs = isArray(cat.subCategories) ? cat.subCategories : [];
      if (subs.length) {
        subs.forEach(sub => {
          const subSec = document.createElement('section');
          subSec.className = 'section subcategory-section';
          const subId = `sub-${sub.id}`;
          subSec.id = subId;
          subSec.appendChild(makeSectionTitle('h3', isString(sub.title) ? sub.title : '子类', isString(sub.description) ? sub.description : ''));
          const items = isArray(sub.items) ? sub.items : [];
          renderItemsGrid(items, subSec, { catId: String(cat.id), subId: String(sub.id) });
          catSec.appendChild(subSec);
        });
      } else {
        const items = isArray(cat.items) ? cat.items : [];
        renderItemsGrid(items, catSec, { catId: String(cat.id) });
      }

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
        <span class="pill">${e.type === 'item' ? '工具' : e.type === 'subcategory' ? '子类' : '分类'}</span>
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
    sec.classList.add('highlight');
    setTimeout(() => sec.classList.remove('highlight'), 1800);
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
          el.classList.add('highlight');
          setTimeout(() => el.classList.remove('highlight'), 1800);
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
