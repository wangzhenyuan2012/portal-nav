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
            alert('添加失败，请重试');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('添加失败，请重试');
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
            window.location.reload();
        } else {
            alert('删除失败，请重试');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('删除失败，请重试');
    }
}