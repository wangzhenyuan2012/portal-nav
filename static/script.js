document.getElementById('addForm')?.addEventListener('submit', async (e) => {
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
            window.location.reload();
        } else {
            showToast('添加失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('添加失败，请重试', 'error');
    }
});

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
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
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