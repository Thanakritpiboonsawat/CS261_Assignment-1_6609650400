document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageElement = document.getElementById('message');
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordButton.querySelector('.show-password').textContent = type === 'password' ? '🕶️' : '👀';
    });

    // Show error message
    function showErrorMessage(message) {
        messageElement.innerHTML = message;
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    }

    // Show success message based on role
    function showSuccessMessage(data, role) {
        let messageContent = '';
        
        if (role === 'student') {
            messageContent = `
                <div class="success-message">
                    <h3>ข้อมูลนักศึกษา</h3>
                    <p><strong>สถานะ:</strong> ${data.status ? 'สำเร็จ' : 'ไม่สำเร็จ'}</p>
                    <p><strong>สถานะการศึกษา:</strong> ${data.tu_status || 'ไม่ระบุ'}</p>
                    <p><strong>ข้อความ:</strong> ${data.message || 'ไม่มี'}</p>
                    <p><strong>รหัสนักศึกษา:</strong> ${data.username || 'ไม่ระบุ'}</p>
                    <p><strong>ชื่อ-นามสกุล (ไทย):</strong> ${data.displayname_th || 'ไม่ระบุ'}</p>
                    <p><strong>ชื่อ-นามสกุล (อังกฤษ):</strong> ${data.displayname_en || 'ไม่ระบุ'}</p>
                    <p><strong>รหัสสถานะ:</strong> ${data.statusid || 'ไม่ระบุ'}</p>
                    <p><strong>อีเมล:</strong> ${data.email || 'ไม่ระบุ'}</p>
                    <p><strong>ประเภทผู้ใช้:</strong> ${data.type || 'ไม่ระบุ'}</p>
                    <p><strong>ภาควิชา:</strong> ${data.department || 'ไม่ระบุ'}</p>
                    <p><strong>คณะ:</strong> ${data.faculty || 'ไม่ระบุ'}</p>
                </div>
            `;
        } else {
            const statusWorkMap = {
                '0': 'ลาออก',
                '1': 'ปฏิบัติงาน',
                '2': 'ไม่ปฏิบัติงาน'
            };
            
            messageContent = `
                <div class="success-message">
                    <h3>ข้อมูลอาจารย์</h3>
                    <p><strong>สถานะ:</strong> ${data.status ? 'สำเร็จ' : 'ไม่สำเร็จ'}</p>
                    <p><strong>ข้อความ:</strong> ${data.message || 'ไม่มี'}</p>
                    <p><strong>ประเภทผู้ใช้:</strong> ${data.type || 'ไม่ระบุ'}</p>
                    <p><strong>รหัสพนักงาน:</strong> ${data.username || 'ไม่ระบุ'}</p>
                    <p><strong>ชื่อ-นามสกุล (ไทย):</strong> ${data.displayname_th || 'ไม่ระบุ'}</p>
                    <p><strong>ชื่อ-นามสกุล (อังกฤษ):</strong> ${data.displayname_en || 'ไม่ระบุ'}</p>
                    <p><strong>สถานะการทำงาน:</strong> ${statusWorkMap[data.StatusWork] || 'ไม่ระบุ'}</p>
                    <p><strong>สถานะพนักงาน:</strong> ${data.StatusEmp || 'ไม่ระบุ'}</p>
                    <p><strong>อีเมล:</strong> ${data.email || 'ไม่ระบุ'}</p>
                    <p><strong>ภาควิชา:</strong> ${data.department || 'ไม่ระบุ'}</p>
                    <p><strong>องค์กร:</strong> ${data.organization || 'ไม่ระบุ'}</p>
                </div>
            `;
        }

        messageElement.innerHTML = messageContent;
        messageElement.className = 'message success';
        messageElement.style.display = 'block';
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (!username || !password || !role) {
            showErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const response = await fetch('https://restapi.tu.ac.th/api/v1/auth/Ad/verify2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Application-Key': 'TU7673a539942cc20b4a6f08e4029b777d36d8f222802074b6db7ceecddbd1d53c1c8d69491cd1290ecda41f1f8b7c3df5'
                },
                body: JSON.stringify({ UserName: username, PassWord: password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'การเชื่อมต่อผิดพลาด');
            }

            if (data.status) {
                const userType = data.type?.toLowerCase();
                if ((role === 'student' && userType === 'student') || 
                    (role === 'lecturer' && userType === 'employee')) {
                    showSuccessMessage(data, role);
                } else {
                    showErrorMessage(`บทบาทไม่ถูกต้อง คุณเป็น ${userType} แต่เลือกบทบาท ${role}`);
                }
            } else {
                showErrorMessage(data.message || 'การล็อกอินล้มเหลว');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการล็อกอิน กรุณาลองใหม่อีกครั้ง');
        }
    });
});