(function(){
  'use strict';
  const DEFAULT_ICON = 'https://pic1.imgdb.cn/item/68f1b8ccc5157e1a887a8c09.png';

  // State
  let data = { navigationItems: [] };
  let selectedCategoryId = null;
  let selectedSubcategoryId = null;

  // Elements
  const categoryList = document.getElementById('categoryList');
  const subcategoryList = document.getElementById('subcategoryList');
  const itemList = document.getElementById('itemList');

  const currentCategoryName = document.getElementById('currentCategoryName');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const addSubcategoryBtn = document.getElementById('addSubcategoryBtn');
  const addItemBtn = document.getElementById('addItemBtn');
  const editCategoryBtn = document.getElementById('editCategoryBtn');
  const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

  const reloadBtn = document.getElementById('reloadBtn');
  const validateBtn = document.getElementById('validateBtn');
  const saveBtn = document.getElementById('saveBtn');

  const toastEl = document.getElementById('toast');

  // Editor dialog
  const editorDialog = document.getElementById('editorDialog');
  const editorForm = document.getElementById('editorForm');
  const editorTitle = document.getElementById('editorTitle');
  const fieldTitle = document.getElementById('fieldTitle');
  const fieldIcon = document.getElementById('fieldIcon');
  const fieldDescription = document.getElementById('fieldDescription');
  const fieldHref = document.getElementById('fieldHref');
  const fieldEnabled = document.getElementById('fieldEnabled');
  const editorSaveBtn = document.getElementById('editorSaveBtn');

  let editorContext = null; // {type: 'category'|'subcategory'|'item', catId, subId, id}

  // Utils
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=>toastEl.classList.remove('show'), 1800);
  }
  function isString(v){ return typeof v === 'string'; }
  function isBool(v){ return typeof v === 'boolean'; }
  function genId(){
    // time + random to ensure uniqueness
    const base = Date.now().toString();
    const rand = Math.floor(Math.random()*1e6).toString().padStart(6,'0');
    let id = base + rand;
    const allIds = new Set(getAllIds());
    while(allIds.has(id)){
      id = (Date.now()+Math.floor(Math.random()*1000)).toString() + Math.floor(Math.random()*1e6).toString().padStart(6,'0');
    }
    return id;
  }
  function getAllIds(){
    const ids = [];
    data.navigationItems.forEach(cat=>{
      ids.push(cat.id);
      (cat.items||[]).forEach(it=>ids.push(it.id));
      (cat.subCategories||[]).forEach(sub=>{
        ids.push(sub.id);
        (sub.items||[]).forEach(it=>ids.push(it.id));
      });
    });
    return ids;
  }
  function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

  // Validation
  function validateData(d){
    if(!d || !Array.isArray(d.navigationItems)) return { ok:false, error:'根对象必须包含 navigationItems 数组' };
    for(const cat of d.navigationItems){
      const r = validateCategory(cat);
      if(!r.ok) return r;
    }
    return { ok:true };
  }
  function validateCategory(cat){
    if(!cat || !isString(cat.id) || !isString(cat.title)) return { ok:false, error:'一级分类必须包含 id(string), title(string)' };
    // optional fields
    if(cat.icon && !isString(cat.icon)) return { ok:false, error:`icon 必须字符串: ${cat.title}` };
    if(cat.description && !isString(cat.description)) return { ok:false, error:`description 必须字符串: ${cat.title}` };
    if(!isBool(!!cat.enabled)) cat.enabled = true;
    // items
    if(!Array.isArray(cat.items)) cat.items = [];
    for(const it of cat.items){ 
      const r = validateItem(it); 
      if(!r.ok) return r; 
    }
    // subCategories
    if(!Array.isArray(cat.subCategories)) cat.subCategories = [];
    for(const sub of cat.subCategories){ 
      const r = validateSubCategory(sub); 
      if(!r.ok) return r; 
    }
    return { ok:true };
  }
  function validateSubCategory(sub){
    if(!sub || !isString(sub.id) || !isString(sub.title)) return { ok:false, error:'二级分类必须包含 id(string), title(string)' };
    if(sub.icon && !isString(sub.icon)) return { ok:false, error:`icon 必须字符串（二级）: ${sub.title}` };
    if(sub.description && !isString(sub.description)) return { ok:false, error:`description 必须字符串（二级）: ${sub.title}` };
    if(!isBool(!!sub.enabled)) sub.enabled = true;
    // items
    if(!Array.isArray(sub.items)) sub.items = [];
    for(const it of sub.items){ 
      const r = validateItem(it); 
      if(!r.ok) return r; 
    }
    return { ok:true };
  }
  function validateItem(it){
    if(!it || !isString(it.id) || !isString(it.title)) return { ok:false, error:'工具必须包含 id(string), title(string)' };
    if(it.href && !isString(it.href)) return { ok:false, error:`href 必须字符串: ${it.title}` };
    if(it.description && !isString(it.description)) return { ok:false, error:`description 必须字符串: ${it.title}` };
    if(it.icon && !isString(it.icon)) return { ok:false, error:`icon 必须字符串: ${it.title}` };
    if(!isBool(!!it.enabled)) it.enabled = true;
    if(!it.icon) it.icon = DEFAULT_ICON;
    return { ok:true };
  }

  // Load
  async function load(){
    try{
      const res = await fetch('/navsphere/content/navigation.json', { cache:'no-store' });
      const j = await res.json();
      const copy = deepClone(j);
      const v = validateData(copy);
      if(!v.ok){ showToast('加载时校验失败: '+v.error); }
      data = copy;
      render();
      showToast('数据已加载');
    }catch(e){
      console.error(e);
      showToast('加载失败，请确保 /navsphere/content/navigation.json 可访问');
    }
  }

  // Render
  function render(){
    // categories
    categoryList.innerHTML = '';
    data.navigationItems.forEach(cat=>{
      const li = makeListItem({
        id: cat.id,
        title: cat.title,
        badge: '一级',
        onEdit: ()=>openEditor('category', cat.id),
        onDelete: ()=>deleteCategory(cat.id)
      });
      li.dataset.id = cat.id;
      li.dataset.kind = 'category';
      li.draggable = true;
      categoryList.appendChild(li);
    });
    enableDrag(categoryList, 'category');

    // current selection
    const cat = data.navigationItems.find(c=>c.id===selectedCategoryId) || null;
    currentCategoryName.textContent = cat ? cat.title : '未选择';
    editCategoryBtn.disabled = !cat;
    deleteCategoryBtn.disabled = !cat;
    addSubcategoryBtn.disabled = !cat;
    addItemBtn.disabled = !cat; // 允许向一级直接添加工具

    // subcategories
    subcategoryList.innerHTML = '';
    if(cat){
      (cat.subCategories||[]).forEach(sub=>{
        const li = makeListItem({
          id: sub.id,
          title: sub.title,
          badge: '二级',
          onEdit: ()=>openEditor('subcategory', cat.id, sub.id),
          onDelete: ()=>deleteSubcategory(cat.id, sub.id)
        });
        li.dataset.id = sub.id;
        li.dataset.kind = 'subcategory';
        li.draggable = true;
        subcategoryList.appendChild(li);
      });
      enableDrag(subcategoryList, 'subcategory');
    }

    // items
    itemList.innerHTML = '';
    const items = getCurrentItems();
    items.forEach(it=>{
      const li = makeListItem({
        id: it.id,
        title: it.title,
        badge: '工具',
        onEdit: ()=>openEditor('item', selectedCategoryId, selectedSubcategoryId, it.id),
        onDelete: ()=>deleteItem(it.id)
      });
      li.dataset.id = it.id;
      li.dataset.kind = 'item';
      li.draggable = true;
      itemList.appendChild(li);
    });
    enableDrag(itemList, 'item');
  }

  function getCurrentItems(){
    const cat = data.navigationItems.find(c=>c.id===selectedCategoryId);
    if(!cat) return [];
    if(selectedSubcategoryId){
      const sub = (cat.subCategories||[]).find(s=>s.id===selectedSubcategoryId);
      return sub ? (sub.items||[]) : [];
    }
    return cat.items || [];
  }

  // List item component
  function makeListItem({id, title, badge, onEdit, onDelete}){
    const li = document.createElement('li');
    li.className = 'list-item';
    const handle = document.createElement('span');
    handle.className = 'handle';
    handle.textContent = '⋮⋮';
    const t = document.createElement('span');
    t.className = 'title';
    t.textContent = title;
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = badge;
    const ops = document.createElement('div');
    ops.className = 'ops';
    const editBtn = document.createElement('button');
    editBtn.textContent = '编辑';
    editBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); onEdit&&onEdit(); });
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); onDelete&&onDelete(); });
    ops.append(editBtn, delBtn);

    li.append(handle, t, b, ops);

    // selection behavior
    li.addEventListener('click', ()=>{
      if(badge==='一级'){
        selectedCategoryId = id;
        selectedSubcategoryId = null;
      }else if(badge==='二级'){
        selectedSubcategoryId = id;
      }
      render();
    });

    return li;
  }

  // Drag & Drop within list
  function enableDrag(listEl, type){
    let dragId = null;
    listEl.addEventListener('dragstart', (e)=>{
      const li = e.target.closest('.list-item');
      dragId = li?.dataset.id || null;
      li && li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    listEl.addEventListener('dragend', (e)=>{
      const li = e.target.closest('.list-item');
      li && li.classList.remove('dragging');
      dragId = null;
    });

    listEl.addEventListener('dragover', (e)=>{
      e.preventDefault();
      listEl.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    });
    listEl.addEventListener('dragleave', ()=>{ listEl.classList.remove('drag-over'); });
    listEl.addEventListener('drop', (e)=>{
      e.preventDefault();
      listEl.classList.remove('drag-over');
      const li = e.target.closest('.list-item');
      const targetId = li?.dataset.id || null;

      if(!dragId) return;
      if(type==='category') reorderCategory(dragId, targetId);
      else if(type==='subcategory') reorderSubcategory(dragId, targetId);
      else if(type==='item') reorderItem(dragId, targetId);
    });
  }

  function reorderCategory(dragId, targetId){
    const arr = data.navigationItems;
    const fromIdx = arr.findIndex(x=>x.id===dragId);
    if(fromIdx<0) return;
    const [m] = arr.splice(fromIdx,1);
    const toIdx = targetId ? arr.findIndex(x=>x.id===targetId) : arr.length;
    arr.splice(toIdx,0,m);
    autoSave('一级分类排序已更新');
    render();
  }
  function reorderSubcategory(dragId, targetId){
    const cat = data.navigationItems.find(c=>c.id===selectedCategoryId);
    if(!cat) return;
    const arr = cat.subCategories||[];
    const fromIdx = arr.findIndex(x=>x.id===dragId);
    if(fromIdx<0) return;
    const [m] = arr.splice(fromIdx,1);
    const toIdx = targetId ? arr.findIndex(x=>x.id===targetId) : arr.length;
    arr.splice(toIdx,0,m);
    autoSave('二级分类排序已更新');
    render();
  }
  function reorderItem(dragId, targetId){
    const items = getCurrentItems();
    const fromIdx = items.findIndex(x=>x.id===dragId);
    if(fromIdx<0) return;
    const [m] = items.splice(fromIdx,1);
    const toIdx = targetId ? items.findIndex(x=>x.id===targetId) : items.length;
    items.splice(toIdx,0,m);
    autoSave('工具排序已更新');
    render();
  }

  // Cross move: drop items onto category or subcategory lists to move across
  categoryList.addEventListener('drop', (e)=>{
    const draggingItem = document.querySelector('.list-item.dragging');
    if(!draggingItem) return;
    const id = draggingItem.dataset.id;
    const itemRef = findItemById(id);
    if(!itemRef) return; // only handle items here
    const li = e.target.closest('.list-item');
    const targetCatId = li?.dataset.id || null;
    if(!targetCatId) return;
    moveItemTo(targetCatId, null, id);
  });
  subcategoryList.addEventListener('drop', (e)=>{
    const draggingItem = document.querySelector('.list-item.dragging');
    if(!draggingItem) return;
    const id = draggingItem.dataset.id;
    const itemRef = findItemById(id);
    if(!itemRef) return; // only handle items
    // move into currently selected subcategory (of current category)
    if(!selectedCategoryId){ showToast('请先选择目标一级分类'); return; }
    if(!selectedSubcategoryId){ showToast('请先选择目标二级分类'); return; }
    moveItemTo(selectedCategoryId, selectedSubcategoryId, id);
  });
  itemList.addEventListener('drop', (e)=>{ /* keep for reorder; already handled in enableDrag */ });

  function findItemById(id){
    for(const cat of data.navigationItems){
      for(const it of (cat.items||[])){ if(it.id===id) return { it, catId: cat.id, subId: null }; }
      for(const sub of (cat.subCategories||[])){
        for(const it of (sub.items||[])){ if(it.id===id) return { it, catId: cat.id, subId: sub.id }; }
      }
    }
    return null;
  }
  function moveItemTo(targetCatId, targetSubId, itemId){
    const src = findItemById(itemId);
    if(!src) return;
    // remove from src
    const srcCat = data.navigationItems.find(c=>c.id===src.catId);
    if(src.subId){
      const srcSub = (srcCat.subCategories||[]).find(s=>s.id===src.subId);
      srcSub.items = (srcSub.items||[]).filter(x=>x.id!==itemId);
    }else{
      srcCat.items = (srcCat.items||[]).filter(x=>x.id!==itemId);
    }
    // add to target
    const dstCat = data.navigationItems.find(c=>c.id===targetCatId);
    if(!dstCat) return;
    if(targetSubId){
      const dstSub = (dstCat.subCategories||[]).find(s=>s.id===targetSubId);
      if(!dstSub){ showToast('目标二级分类不存在'); return; }
      dstSub.items = dstSub.items || [];
      dstSub.items.push(src.it);
    }else{
      dstCat.items = dstCat.items || [];
      dstCat.items.push(src.it);
    }
    autoSave('工具已移动');
    render();
  }

  // CRUD
  function addCategory(){
    const id = genId();
    data.navigationItems.push({ id, title: '未命名分类', icon: 'Folder', description: '', enabled: true, items: [], subCategories: [] });
    selectedCategoryId = id;
    selectedSubcategoryId = null;
    autoSave('已新增一级分类');
    render();
    openEditor('category', id);
  }
  function deleteCategory(id){
    if(!confirm('确定删除该一级分类及其所有内容？')) return;
    data.navigationItems = data.navigationItems.filter(x=>x.id!==id);
    if(selectedCategoryId===id){ selectedCategoryId = null; selectedSubcategoryId = null; }
    autoSave('已删除一级分类');
    render();
  }
  function addSubcategory(){
    const cat = data.navigationItems.find(c=>c.id===selectedCategoryId);
    if(!cat) return;
    const id = genId();
    cat.subCategories = cat.subCategories||[];
    cat.subCategories.push({ id, title: '未命名子类', icon: 'Tag', description: '', enabled: true, items: [] });
    selectedSubcategoryId = id;
    autoSave('已新增二级分类');
    render();
    openEditor('subcategory', cat.id, id);
  }
  function deleteSubcategory(catId, subId){
    const cat = data.navigationItems.find(c=>c.id===catId);
    if(!cat) return;
    if(!confirm('确定删除该二级分类及其工具？')) return;
    cat.subCategories = (cat.subCategories||[]).filter(s=>s.id!==subId);
    if(selectedSubcategoryId===subId) selectedSubcategoryId = null;
    autoSave('已删除二级分类');
    render();
  }
  function addItem(){
    const id = genId();
    const it = { id, title: '未命名工具', href: '', description: '', icon: DEFAULT_ICON, enabled: true };
    const cat = data.navigationItems.find(c=>c.id===selectedCategoryId);
    if(!cat) return;
    if(selectedSubcategoryId){
      const sub = (cat.subCategories||[]).find(s=>s.id===selectedSubcategoryId);
      sub.items = sub.items||[]; sub.items.push(it);
    }else{
      cat.items = cat.items||[]; cat.items.push(it);
    }
    autoSave('已新增工具');
    render();
    openEditor('item', selectedCategoryId, selectedSubcategoryId||null, id);
  }
  function deleteItem(id){
    if(!confirm('确定删除该工具？')) return;
    for(const cat of data.navigationItems){
      cat.items = (cat.items||[]).filter(x=>x.id!==id);
      for(const sub of (cat.subCategories||[])){
        sub.items = (sub.items||[]).filter(x=>x.id!==id);
      }
    }
    autoSave('已删除工具');
    render();
  }

  // Editor
  function openEditor(type, catId, subId, id){
    editorContext = { type, catId: catId||null, subId: subId||null, id: id||null };
    // Prepare values
    let title = '', icon = '', description = '', href = '', enabled = true;
    if(type==='category'){
      const cat = data.navigationItems.find(c=>c.id===catId);
      if(cat){ title = cat.title||''; icon = cat.icon||''; description = cat.description||''; enabled = !!cat.enabled; }
      editorTitle.textContent = '编辑一级分类';
      fieldHref.parentElement.classList.add('only-item');
      fieldHref.parentElement.style.display = 'none';
    }else if(type==='subcategory'){
      const cat = data.navigationItems.find(c=>c.id===catId);
      const sub = cat && (cat.subCategories||[]).find(s=>s.id===subId);
      if(sub){ title = sub.title||''; icon = sub.icon||''; description = sub.description||''; enabled = !!sub.enabled; }
      editorTitle.textContent = '编辑二级分类';
      fieldHref.parentElement.classList.add('only-item');
      fieldHref.parentElement.style.display = 'none';
    }else if(type==='item'){
      const ref = findItemById(id);
      if(ref){ const it = ref.it; title = it.title||''; icon = it.icon||''; description = it.description||''; href = it.href||''; enabled = !!it.enabled; }
      editorTitle.textContent = '编辑工具';
      fieldHref.parentElement.style.display = '';
    }
    fieldTitle.value = title;
    fieldIcon.value = icon;
    fieldDescription.value = description;
    fieldHref.value = href;
    fieldEnabled.checked = enabled;
    editorDialog.showModal();
  }

  editorForm.addEventListener('close', ()=>{ editorContext = null; });
  editorSaveBtn.addEventListener('click', (e)=>{
    e.preventDefault(); // prevent dialog close by default
    if(!editorContext) return;
    const title = fieldTitle.value.trim();
    const icon = fieldIcon.value.trim();
    const description = fieldDescription.value.trim();
    const href = fieldHref.value.trim();
    const enabled = !!fieldEnabled.checked;
    if(!title){ showToast('标题不能为空'); return; }

    if(editorContext.type==='category'){
      const cat = data.navigationItems.find(c=>c.id===editorContext.catId);
      if(cat){ cat.title = title; cat.icon = icon || cat.icon || 'Folder'; cat.description = description; cat.enabled = enabled; }
      autoSave('已更新一级分类');
    }else if(editorContext.type==='subcategory'){
      const cat = data.navigationItems.find(c=>c.id===editorContext.catId);
      const sub = cat && (cat.subCategories||[]).find(s=>s.id===editorContext.subId);
      if(sub){ sub.title = title; sub.icon = icon || sub.icon || 'Tag'; sub.description = description; sub.enabled = enabled; }
      autoSave('已更新二级分类');
    }else if(editorContext.type==='item'){
      const ref = findItemById(editorContext.id);
      if(ref){ const it = ref.it; it.title = title; it.icon = icon || DEFAULT_ICON; it.description = description; it.href = href; it.enabled = enabled; }
      autoSave('已更新工具');
    }
    editorDialog.close();
    render();
  });

  // Auto save: validate then update navigation.json file
  function autoSave(msg){
    const copy = deepClone(data);
    const v = validateData(copy);
    if(!v.ok){ showToast('保存校验失败: '+v.error); return; }
    updateJsonFile(copy);
    showToast(msg);
  }
  async function updateJsonFile(obj){
    try {
      // 尝试使用POST方法，因为服务器可能不支持PUT
      const response = await fetch('/navsphere/content/navigation.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(obj, null, 2)
      });
      
      if (!response.ok) {
        // 如果是405错误，提供更详细的提示
        if (response.status === 405) {
          throw new Error('服务器不支持此操作(405)。请检查服务器配置是否允许文件写入。');
        }
        throw new Error('文件保存失败: ' + response.status);
      }
      
      console.log('文件已成功更新');
    } catch (error) {
      console.error('保存文件时出错:', error);
      showToast('保存失败: ' + error.message);
      
      // 提供备选方案：下载文件
      if (error.message.includes('405')) {
        setTimeout(() => {
          if (confirm('服务器不支持直接保存。是否下载文件到本地？')) {
            downloadJson(obj);
          }
        }, 1000);
      }
    }
  }

  // Bind toolbar events
  addCategoryBtn.addEventListener('click', addCategory);
  addSubcategoryBtn.addEventListener('click', addSubcategory);
  addItemBtn.addEventListener('click', addItem);
  editCategoryBtn.addEventListener('click', ()=>{ if(!selectedCategoryId) return; openEditor('category', selectedCategoryId); });
  deleteCategoryBtn.addEventListener('click', ()=>{ if(!selectedCategoryId) return; deleteCategory(selectedCategoryId); });

  reloadBtn.addEventListener('click', load);
  validateBtn.addEventListener('click', ()=>{
    const v = validateData(deepClone(data));
    if(v.ok) showToast('JSON 合规'); else showToast('JSON 不合规: '+v.error);
  });
  saveBtn.addEventListener('click', ()=>{
    const copy = deepClone(data);
    const v = validateData(copy);
    if(!v.ok){ showToast('保存失败: '+v.error); return; }
    downloadJson(copy);
    showToast('已保存 navigation.json');
  });

  // Init
  load();
})();
