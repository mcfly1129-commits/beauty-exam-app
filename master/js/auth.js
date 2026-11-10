function getCurrentUser() {
  const userJson = localStorage.getItem('beauty_app_current_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch(e) {
      return null;
    }
  }
  return null;
}

function setCurrentUser(user) {
  localStorage.setItem('beauty_app_current_user', JSON.stringify(user));
  localStorage.setItem('teacher_isLoggined', 'true');
  localStorage.setItem('teacher_userEmail', user.student_name || 'user');
}

async function loginWithSerialCode(serialCode, studentName) {
  if (!serialCode || !studentName) {
    return{ success: false, message: "sirial code and name required" };
  }
  const userObj = {
    serial_code: serialCode.trim(),
    student_name: studentName.trim(),
    school_name: "beauty school",
    login_at: new Date().toISOString()
  };
  setCurrentUser(userObj);
  return { success: true, user: userObj };
}

function logout() {
  localStorage.removeItem('beauty_app_current_user');
  localStorage.removeItem('teacher_isLoggined');
  localStorage.removeItem('teacher_userEmail');
  window.location.href = '../index.html';
}
