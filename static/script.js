document.addEventListener('DOMContentLoaded', () => {
    initializeFormHandling();
    initializeDragAndDrop();
});

// 表单处理初始化
function initializeFormHandling() {
    const addForm = document.getElementById('addForm');
    if (!addForm) return;

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            url: document.getElementById('url').value,
            description: document.getElementById('description').value
        };
        
        try {
            const response = await fetch('/api/navigation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showToast('添加成功', 'success');
                window.location.reload();
            } else {
                showToast('添加失败，请重试', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('添加失败，请重试', 'error');
        }
    });
}

// 拖拽功能初始化
function initializeDragAndDrop() {
    const navigationGrid = document.getElementById('navigationGrid');
    if (!navigationGrid) return;

    const cards = navigationGrid.querySelectorAll('.nav-card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedCard = null;
let dragTimeout = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    
    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    
    // 延迟添加透明效果，使拖拽更顺滑
    dragTimeout = setTimeout(() => {
        this.style.opacity = '0.7';
    }, 0);
}

function handleDragEnd(e) {
    if (dragTimeout) {
        clearTimeout(dragTimeout);
    }
    
    this.style.opacity = '';
    this.classList.remove('dragging');
    draggedCard = null;
    
    // 清除所有卡片的drag-over效果
    const cards = document.querySelectorAll('.nav-card');
    cards.forEach(card => {
        card.classList.remove('drag-over');
        card.style.transform = '';
    });
}

function handleDragOver(e) {
    if (!draggedCard) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    if (!draggedCard || this === draggedCard) return;
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (this === draggedCard) return;
    
    const sourceId = e.dataTransfer.getData('text/plain');
    const targetId = this.dataset.id;
    
    try {
        const response = await fetch('/api/navigation/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sourceId: sourceId,
                targetId: targetId
            })
        });
        
        if (response.ok) {
            showToast('排序已更新', 'success');
            window.location.reload();
        } else {
            showToast('排序更新失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('排序更新失败，请重试', 'error');
    }
}

async function deleteNavItem(id) {
    if (!confirm('确定要删除这个导航项吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/navigation?id=${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const card = document.querySelector(`[data-id="${id}"]`);
            card.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                showToast('删除成功', 'success');
                window.location.reload();
            }, 300);
        } else {
            showToast('删除失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('删除失败，请重试', 'error');
    }
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 添加渐入动画
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.nav-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});