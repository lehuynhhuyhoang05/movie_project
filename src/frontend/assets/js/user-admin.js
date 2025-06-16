// user-admin.js
let users = [];

function capitalizeWords(str) {
  return str.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  const search = document.getElementById('searchUser').value.trim().toLowerCase();
  const roleFilter = document.getElementById('filterRole').value.toLowerCase();

  const filtered = users.filter(u => {
    const searchMatch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const roleMatch = roleFilter === 'all' || u.role === roleFilter;
    return searchMatch && roleMatch;
  });

  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${capitalize(u.role)}</td>
      <td>${u.createdAt}</td>
      <td>
        <button class="action-btn editBtn" onclick="editUser(${u.id})">Sửa</button>
        <button class="action-btn deleteBtn" onclick="deleteUserAPI(${u.id})">Xóa</button>
      </td>
    </tr>
  `).join('');
  updateStats();
}

function updateStats() {
  const totalUsersEl = document.getElementById('totalUsers');
  const newTodayEl = document.getElementById('newToday');
  totalUsersEl.textContent = users.length;
  const today = new Date().toISOString().slice(0, 10);
  const newTodayCount = users.filter(u => u.createdAt === today).length;
  newTodayEl.textContent = newTodayCount;

  window.chartData = window.chartData || { users: 0 };
  window.chartData.users = users.length;
  if (window.updateChart) window.updateChart(window.currentActiveIndex);
}

async function loadUsersFromAPI() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập trước!');
    return;
  }

  const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=index&token=Bearer%20${token}`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error('Lỗi khi gọi API');
    const data = await response.json();
    if (data.status === 'success' && Array.isArray(data.data)) {
      users = data.data.map(u => ({
        id: u.id,
        name: u.username || '',
        email: u.email || '',
        role: (u.role || '').toLowerCase(),
        createdAt: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : ''
      }));
      renderUsers();
    } else {
      alert('Lỗi: ' + (data.message || 'Dữ liệu trả về không đúng định dạng'));
      users = [];
      renderUsers();
    }
  } catch (error) {
    alert('Lỗi tải người dùng: ' + error.message);
    users = [];
    renderUsers();
  }
}

async function updateUser(userData, isUpdate = true) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập trước!');
    return false;
  }

  const method = isUpdate ? 'PUT' : 'POST';
  const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=${isUpdate ? 'update' : 'create'}&token=Bearer%20${token}`;
  const bodyData = isUpdate
    ? { id: userData.id, username: userData.username, email: userData.email, role: userData.role, full_name: userData.full_name, avatar: userData.avatar || '' }
    : { username: userData.username, password: userData.password, email: userData.email, role: userData.role };

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (data.status === 'success') {
      alert(isUpdate ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng thành công!');
      await loadUsersFromAPI();
      return true;
    } else {
      alert('Lỗi: ' + (data.message || 'Thao tác không thành công'));
      return false;
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
    return false;
  }
}

async function deleteUserAPI(id) {
  if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập trước!');
    return;
  }

  try {
    const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=delete&id=${id}&token=Bearer%20${token}`;
    const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error('Lỗi khi gọi API xóa: ' + response.status);
    const data = await response.json();
    if (data.status === 'success') {
      alert('Xóa người dùng thành công!');
      await loadUsersFromAPI();
      resetForm();
    } else {
      alert('Lỗi: ' + (data.message || 'Xóa không thành công'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

function editUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) return alert('Người dùng không tồn tại!');
  document.getElementById('editUserId').value = user.id;
  document.getElementById('userName').value = user.name;
  document.getElementById('userEmail').value = user.email;
  document.getElementById('userRole').value = user.role;
  document.getElementById('userPassword').value = '';
  document.getElementById('formTitle').textContent = 'Sửa Người Dùng';
  document.getElementById('cancelEdit').style.display = 'inline-block';
}

async function saveUser(event) {
  event.preventDefault();
  const id = document.getElementById('editUserId').value;
  let name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  let role = document.getElementById('userRole').value.trim().toLowerCase();
  const password = document.getElementById('userPassword').value.trim();

  if (!email || !role) {
    alert('Vui lòng nhập đầy đủ thông tin.');
    return;
  }
  if (!id && !password) {
    alert('Vui lòng nhập mật khẩu khi tạo người dùng mới.');
    return;
  }
  if (role !== 'user' && role !== 'admin') {
    alert('Vai trò phải là "user" hoặc "admin".');
    return;
  }

  name = capitalizeWords(name);
  const userData = { id: id || undefined, username: name, email, role, full_name: name, avatar: '' };
  if (!id) userData.password = password;

  const isUpdate = !!id;
  const success = await updateUser(userData, isUpdate);
  if (success) resetForm();
}

function resetForm() {
  document.getElementById('userForm').reset();
  document.getElementById('editUserId').value = '';
  document.getElementById('formTitle').textContent = 'Thêm Người Dùng Mới';
  document.getElementById('cancelEdit').style.display = 'none';
}

document.getElementById('userForm').addEventListener('submit', saveUser);
document.getElementById('cancelEdit').addEventListener('click', resetForm);
document.getElementById('searchUser').addEventListener('input', renderUsers);
document.getElementById('filterRole').addEventListener('change', renderUsers);

document.addEventListener('DOMContentLoaded', loadUsersFromAPI);