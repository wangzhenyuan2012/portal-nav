# app.py
from flask import Flask, render_template, jsonify, request, redirect, url_for
import json
import os

app = Flask(__name__)

# 确保data目录存在
if not os.path.exists('data'):
    os.makedirs('data')

# 数据文件路径
DATA_FILE = 'data/navigation.json'

# 如果数据文件不存在，创建一个空的数据文件
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False)

def load_navigation():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_navigation(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, ensure_ascii=False, indent=2, fp=f)

@app.route('/')
def index():
    navigation = load_navigation()
    return render_template('index.html', navigation=navigation)

@app.route('/edit')
def edit():
    navigation = load_navigation()
    return render_template('edit.html', navigation=navigation)

@app.route('/api/navigation', methods=['GET', 'POST', 'DELETE'])
def handle_navigation():
    if request.method == 'GET':
        return jsonify(load_navigation())
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'title' not in data or 'url' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        navigation = load_navigation()
        new_item = {
            'id': len(navigation) + 1,
            'title': data['title'],
            'url': data['url'],
            'description': data.get('description', ''),
            'order': len(navigation)  # Add order field
        }
        navigation.append(new_item)
        save_navigation(navigation)
        return jsonify(new_item)
    
    elif request.method == 'DELETE':
        item_id = request.args.get('id')
        if not item_id:
            return jsonify({'error': 'Missing ID'}), 400
        
        navigation = load_navigation()
        navigation = [item for item in navigation if str(item['id']) != item_id]
        # 更新排序
        for i, item in enumerate(navigation):
            item['order'] = i
        save_navigation(navigation)
        return jsonify({'message': 'Deleted successfully'})

@app.route('/api/navigation/reorder', methods=['POST'])
def reorder_navigation():
    data = request.get_json()
    if not data or 'sourceId' not in data or 'targetId' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    source_id = int(data['sourceId'])
    target_id = int(data['targetId'])
    
    navigation = load_navigation()
    
    # 找到源项和目标项的索引
    source_item = next((item for item in navigation if item['id'] == source_id), None)
    target_item = next((item for item in navigation if item['id'] == target_id), None)
    
    if not source_item or not target_item:
        return jsonify({'error': 'Items not found'}), 404
    
    # 获取当前顺序
    source_order = source_item['order']
    target_order = target_item['order']
    
    # 更新顺序
    if source_order < target_order:
        for item in navigation:
            if source_order < item['order'] <= target_order:
                item['order'] -= 1
    else:
        for item in navigation:
            if target_order <= item['order'] < source_order:
                item['order'] += 1
    
    source_item['order'] = target_order
    
    # 按顺序排序
    navigation.sort(key=lambda x: x['order'])
    save_navigation(navigation)
    
    return jsonify({'message': 'Reordered successfully'})

if __name__ == '__main__':
    app.run(host=0.0.0.0,debug=True)